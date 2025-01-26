import { Client } from "@hubspot/api-client";
import {
  FilterOperatorEnum,
  PublicObjectSearchRequest,
  SimplePublicObject,
} from "@hubspot/api-client/lib/codegen/crm/contacts";
import {
  CollectionResponseWithTotalSimplePublicObjectForwardPaging,
  SimplePublicObjectInput,
} from "@hubspot/api-client/lib/codegen/crm/deals";
import { logger } from "../dependencies/logger";

export class HubSpotService {
  private hubspotClient: Client;

  public constructor() {
    this.hubspotClient = new Client({
      accessToken: process.env.HUBSPOT_ACCESS_TOKEN,
    });
  }

  public async createContact(
    email: string,
    properties: { [key: string]: string }
  ) {
    try {
      const runningInTests =
        process.env.NODE_ENV && process.env.NODE_ENV === "test";
      if (runningInTests) return;

      const contactObject = {
        properties: {
          email: email,
          ...properties,
        },
      };
      const contact = await this.hubspotClient.crm.contacts.basicApi.create(
        contactObject
      );
      logger.info(`Added user to HubSpot with email ${email}`);
      return contact;
    } catch (e) {
      const errorText = e?.body?.message;
      if (
        errorText?.indexOf("Contact already exists.") !== -1 &&
        e.code === 409
      ) {
        logger.warn("User already exists in HubSpot. Moving on.");
        return undefined;
      } else throw e;
    }
  }

  public async createOrUpdateContact(
    email: string,
    properties: { [key: string]: string }
  ) {
    const runningInTests =
      process.env.NODE_ENV && process.env.NODE_ENV === "test";
    if (runningInTests) {
      const obj = new SimplePublicObject();
      obj.id = "100";
      const dummyProps = {};
      Object.keys(properties).forEach((x) => {
        dummyProps[x] = "";
      });

      obj.properties = dummyProps;
      return obj;
    }

    // try creating a contact first
    const newContact = await this.createContact(email, properties);
    if (typeof newContact === "undefined") {
      // this contact already existed; Update it instead
      const propertyList = Object.keys(properties);
      const existingContact = await this.getContactPropertiesByEmail(
        email,
        propertyList
      );
      return await this.updateContactProperties(
        existingContact.hs_object_id,
        properties
      );
    } else {
      return newContact;
    }
  }

  public async updateContactProperties(
    id: string,
    properties: { [key: string]: string }
  ) {
    const runningInTests =
      process.env.NODE_ENV && process.env.NODE_ENV === "test";
    if (runningInTests) return;

    const updates: SimplePublicObjectInput = {
      properties: properties,
    };

    logger.info(`Updating HubSpot contact with id ${id}`);
    return await this.hubspotClient.crm.contacts.basicApi.update(id, updates);
  }

  public async getContactPropertiesByEmail(
    email: string,
    properties: string[]
  ) {
    const runningInTests =
      process.env.NODE_ENV && process.env.NODE_ENV === "test";

    if (runningInTests) {
      // ensure that the return in testing has all the requested properties
      const dummyReturn = {};
      properties.forEach((el) => {
        if (el === "propio_valid_license_expiry_date")
          dummyReturn[el] = new Date().getTime();
        else dummyReturn[el] = "";
      });

      return dummyReturn;
    }

    const filter = {
      propertyName: "email",
      operator: "EQ" as FilterOperatorEnum,
      value: email,
    };

    const searchRequest: PublicObjectSearchRequest = {
      filterGroups: [
        {
          filters: [filter],
        },
      ],
      sorts: [],
      properties: properties,
      limit: 1,
      after: 0,
    };

    const result = await this.hubspotClient.crm.contacts.searchApi.doSearch(
      searchRequest
    );
    if (result.total === 0) {
      throw new Error(`HubSpot contact with email ${email} not found`);
    }

    const resultProps = result.results[0].properties;

    const contactProps: any = {
      ...resultProps,
    };

    // if we requested whether there is a valid license, return it as a true boolean, not string
    if ("propio_valid_license" in contactProps) {
      contactProps.propio_valid_license =
        resultProps.propio_valid_license === "true";
    }

    return contactProps;
  }

  /**
   * Gets the portal ID for this HubSpot instance's data
   * (useful to generate links to contacts and differentiate
   * between DEV and PROD)
   * @returns the HubSpot portal ID
   */
  public async getPortalId() {
    const response = await this.hubspotClient.apiRequest({
      method: "GET",
      path: "/integrations/v1/me",
    });

    const json = await response.json();

    return json.portalId;
  }

  public async getDeals() {
    const properties = [
      "amount",
      "closedate",
      "createdate",
      "hs_lastmodifieddate",
      "notes_last_updated",
      "hs_object_id",
      "createdate",
      "hubspot_owner_id",
      "dealname",
      "hs_is_closed",
      "dealstage",
      "notes_last_contacted",
      "hs_analytics_latest_source",
      "hs_next_step",
      "hs_priority",
    ];

    // Get all records loop
    const getRecords = async (start, limit) => {
      logger.info(`Getting records loop, start=${start}, limit=${limit}`);
      const searchRequest: PublicObjectSearchRequest = {
        // Archived CRM objects won’t appear in any search results. No need to filter.
        filterGroups: [
          {
            filters: [],
          },
        ],
        sorts: [],
        properties: properties,
        limit: limit,
        after: start,
      };
      return await this.hubspotClient.crm.deals.searchApi.doSearch(
        searchRequest
      );
    };

    const agregatedResults: SimplePublicObject[] = [];
    let start = 0;
    const limit = 100;
    let result: CollectionResponseWithTotalSimplePublicObjectForwardPaging;
    do {
      result = await getRecords(start, limit);
      logger.info(`next information ${result.paging?.next?.after}`);

      start += limit;
      agregatedResults.push(...result.results);
    } while (result.paging?.next?.after !== undefined);

    logger.info(
      `fetched all results, total results= ${agregatedResults.length}`
    );
    return agregatedResults;
  }
}
