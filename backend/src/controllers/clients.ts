import { IDatabase, Row } from "../dependencies/database.interface";
import { Client } from "../models/sdk/client";
import { OrganizationsController } from "./organizations";
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from "../dependencies/exceptions";
import { stringOrUndefined } from "./utils";
import { logger } from "../dependencies/logger";
import { ConenctedLedger, SupportedLedgers } from "../models/backend/models";

export class ClientController {
  private conn: IDatabase;
  private organizationController: OrganizationsController;

  constructor(conn: IDatabase) {
    if (!conn) {
      throw Error("No db connection");
    }
    this.conn = conn;
    this.organizationController = new OrganizationsController(conn);
  }

  public async getClientsByOrganizationId(
    organizationId: number
  ): Promise<Client[]> {
    if (!organizationId) {
      throw new Error("Organization ID is required");
    }
    const query = `SELECT
    pc.client_id, pc.partner_id, pc.contact_first_name, pc.contact_last_name, pc.preferred_communication, pc.whatsapp_phone_number, pc.contact_email, pc.organization_id, pc.onboarded, pc.qbo_realm_id,
    porg.name AS organization_name, porg.web_url AS organization_web_url, porg.logo_url AS organization_logo_url, porg.industry as organization_industry
  FROM propio_clients pc
  INNER JOIN propio_organizations porg ON pc.organization_id = porg.organization_id
  WHERE pc.organization_id = $1`;
    const result = await this.conn.execute(query, [organizationId]);
    if (result.rows.length === 0) {
      return [];
    }
    return result.rows.map((row) => ({
      client_uid: row.client_id,
      partner_uid: row.partner_id,
      first_name: row.contact_first_name,
      last_name: row.contact_last_name,
      preferred_communication: row.preferred_communication,
      phone: row.whatsapp_phone_number,
      email: row.contact_email,
      organization: {
        organization_id: row.organization_id,
        name: row.organization_name,
        web_url: row.organization_web_url,
        logo_url: row.organization_logo_url,
        is_onboarded: row.onboarded,
        is_quickbooks_connected:
          row.qbo_realm_id !== null &&
          row.qbo_realm_id !== undefined &&
          row.qbo_realm_id !== "",

        industry: row.organization_industry,
      },
    }));
  }

  /**
   * Create a new client, and it's organization, always.
   *
   * @param client Client data, with organization data
   *
   * @returns ID of the newly created client
   */
  public async createClient(client: Client): Promise<number> {
    try {
      logger.info("Creating client", {
        client: client,
        type: `${typeof client}`,
      });


      const result = await this.createClientInternal(client);

      logger.info("Client created with ID: " + result, { client_id: result });

      return result;
    } catch (e) {
      logger.error(`Error creating client: ${e.toString()}`, {
        error: e,
        stack: e.stack,
      });
      throw e;
    }
  }

  private async createClientInternal(client: Client): Promise<number> {

    const insertClientQuery = `INSERT INTO propio_clients
      (
        contact_first_name,
        contact_last_name,
        preferred_communication,
        whatsapp_phone_number,
        contact_email,
        organization_id
      )
    VALUES (?, ?, ?, ?, ?, ?)`;

    // Create the client: Note that entity_id will be NULL for clients created by this controller.
    const result = await this.conn.execute(insertClientQuery, [
      client.first_name,
      client.last_name,
      client.preferred_communication,
      client.phone,
      client.email,
      client.organization.organization_id,
    ]);

    return result.lastInsertedId;
  }

  /**
   * Get a list of clients from the given partner
   */
  public async getClients(
    limit: number,
    offset: number,
  ): Promise<Client[]> {
    if (limit < 0) {
      throw new Error("Limit must be greater than 0");
    }

    if (offset < 0) {
      throw new Error("Offset must be greater than 0");
    }

    if (limit === 0) {
      throw new Error("Limit must be greater than 0");
    }

    const query = ` SELECT * FROM propio_clients; `;

    const result = await this.conn.query(query, []);
    logger.info("Clients Results", {
      length: result.length,
    });

    return result.map((row: Row) => {
      return {
        client_id: row.client_id,
        first_name: row.contact_first_name,
        last_name: row.contact_last_name,
        preferred_communication: row.preferred_communication,
        phone: row.whatsapp_phone_number,
        email: row.contact_email,
        organization: {
          organization_id: row.organization_id,
          is_onboarded: row.onboarded,
          is_quickbooks_connected: !!row.qbo_realm_id,
          industry: row.organization_industry,
          is_bank_connected: row.connected_accounts_count > 0,
        },
      };
    });
  }

  /**
   * Edit a client, and the organization within it.
   *
   * @param client Client data, with organization data, and client ID
   *
   * @returns ID of the edited client
   */
  public async editClient(client: Client): Promise<number> {
    try {
      const clientId = await this.editClientInternal(client);
      return clientId;
    } catch (e) {
      throw e;
    }
  }

  public async getClientConnectedLedger(
    clientId: number
  ): Promise<ConenctedLedger> {
    if (!clientId) {
      throw new Error("Client ID is required");
    }

    const query = `SELECT
      pc.qbo_realm_id,
      com.ledger_id
    FROM propio_clients pc
    INNER JOIN propio_qbo_companies com ON pc.qbo_realm_id = com.qbo_realm_id
    WHERE client_id = $1 LIMIT 1`;
    const result = await this.conn.execute(query, [clientId]);
    if (result.rows.length === 0) {
      throw new NotFoundException("Client not found");
    }
    const row = result.rows[0];
    return {
      ledger_company_id: row["qbo_realm_id"],
      ledger_id:
        row["ledger_id"] == "QuickBooks"
          ? SupportedLedgers.QuickBooks
          : SupportedLedgers.Xero,
    };
  }

  public async getClientById(clientId: number): Promise<Client> {
    if (!clientId) {
      throw new Error("Client ID is required");
    }

    const query = `
      SELECT
      propio_clients.client_id,
      propio_clients.partner_id,
      propio_clients.contact_first_name,
      propio_clients.contact_last_name,
      propio_clients.preferred_communication,
      propio_clients.whatsapp_phone_number,
      propio_clients.contact_email,
      propio_clients.organization_id,
      propio_clients.onboarded,
      propio_clients.qbo_realm_id,
      propio_clients.transaction_suggestion_confidence_threshold,
      propio_organizations.name AS organization_name,
      propio_organizations.web_url AS organization_web_url,
      propio_organizations.logo_url AS organization_logo_url,
      propio_organizations.industry AS organization_industry
      FROM propio_clients
      INNER JOIN propio_organizations
      ON propio_clients.organization_id = propio_organizations.organization_id
      WHERE propio_clients.client_id = $1
      LIMIT 1
    `;
    const result = await this.conn.execute(query, [clientId]);
    if (result.rows.length === 0) {
      throw new NotFoundException("Client not found");
    }
    const row = result.rows[0];
    return {
      client_uid: row.client_id,
      partner_uid: row.partner_id,
      first_name: row.contact_first_name,
      last_name: row.contact_last_name,
      preferred_communication: row.preferred_communication,
      phone: row.whatsapp_phone_number,
      email: row.contact_email,
      transaction_suggestion_confidence_threshold:
        row.transaction_suggestion_confidence_threshold,
      organization: {
        organization_id: row.organization_id,
        name: row.organization_name,
        web_url: row.organization_web_url,
        logo_url: row.organization_logo_url,
        is_onboarded: row.onboarded,
        is_quickbooks_connected: !!row.qbo_realm_id,
        industry: row.organization_industry,
      },
    };
  }

  private async editClientInternal(client: Client): Promise<number> {
    if (!client.client_uid) {
      throw new BadRequestException("Client ID is required");
    }

    // Edit the client data using the client ID. Database schema can
    // be found in `backend/database.sql`.
    const updateClientQuery = `
      UPDATE propio_clients
      SET
        contact_first_name = $1,
        contact_last_name = $2,
        whatsapp_phone_number = $3,
        contact_email = $4
      WHERE organization_id = $5 `;

    await this.conn.execute(updateClientQuery, [
      client.first_name,
      client.last_name,
      client.phone,
      client.email,
      client.client_uid,
    ]);

    return client.client_uid;
  }

  /**
   * Update the AI confidence threshold for a client.
   *
   * @param clientId Client identifier
   * @param confidenceThreshold Confidence threshold to set, between 0 and 10, or null to reset to default
   *
   * @returns void
   *
   * @throws BadRequestException if the client ID is not provided or the confidence threshold is not between 0 and 10 nor null
   */
  public async updateTransactionAIConfidenceThreshold(
    clientId: number,
    confidenceThreshold?: number
  ): Promise<void> {
    if (!clientId) {
      throw new BadRequestException("Client ID is required");
    }

    if (confidenceThreshold) {
      if (confidenceThreshold < 0 || confidenceThreshold > 10) {
        throw new BadRequestException(
          "Confidence threshold must be between 0 and 10"
        );
      }

      const query = `UPDATE propio_clients
      SET transaction_suggestion_confidence_threshold = $1
      WHERE client_id = $2`;
      await this.conn.execute(query, [confidenceThreshold, clientId]);
    } else {
      const query = `UPDATE propio_clients
      SET transaction_suggestion_confidence_threshold = NULL
      WHERE client_id = $1`;
      await this.conn.execute(query, [clientId]);
    }
  }

}
