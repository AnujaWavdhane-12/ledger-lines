import { Partner, PartnerOnboardingRequest } from "@/models/sdk/models";
import { IDatabase } from "../dependencies/database.interface";
import { logger } from "../dependencies/logger";
import { User } from "../models/sdk/user";
import { UserController } from "./users";
import { NotFoundException } from "../dependencies/exceptions";
import { OrganizationsController } from "./organizations";
import { stringOrUndefined } from "./utils";

export class PartnerController {
  private conn: IDatabase;
  private senderMailDoman: string;
  private organizationController: OrganizationsController;
  private usersController: UserController;

  constructor(conn: IDatabase, senderMailDoman: string) {
    if (!conn) {
      throw Error("No db connection");
    }
    this.conn = conn;
    this.senderMailDoman = senderMailDoman;
    this.organizationController = new OrganizationsController(conn);
    this.usersController = new UserController(conn);
  }

  /**
   * Generate a random string of 5 characters
   *
   * We use this to generate a random salt for the email address in the case that two partners have the same first and last name
   *
   * @returns Random salt
   */
  public generateSalt(): string {
    return Array.from({ length: 5 }, () => Math.random().toString(36)[2]).join(
      ""
    );
  }

  /**
   * Clean a string for use in an email address
   *
   * @param input Input string
   * @returns Cleaned string
   */
  public cleanString(input: string): string {
    return input
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "");
  }

  /**
   * Generate a unique email address for the partner
   *
   * @param user User request object
   * @returns Email address
   */
  public generatePartnerSenderEmailAddress(user: User): string {
    if (!user.first_name || !user.last_name) {
      throw Error("First name and last name are required to generate email");
    }

    const first_name = this.cleanString(user.first_name);
    const last_name = this.cleanString(user.last_name);
    const name_part = `${first_name}${last_name}`.substring(0, 10);
    const salt = this.cleanString(this.generateSalt()).substring(0, 5);

    return `${name_part}-${salt}@${this.senderMailDoman}`;
  }

  /**
   * Count the number of partners for a given user
   *
   * @param auth0UserId Auth0 user ID of the logged in user
   * @returns Number of partners
   */
  public async countPartnerIdsByAuth0Id(auth0UserId: string): Promise<number> {
    const query = `SELECT
       count(pp.partner_id) as cnt
    FROM propio_partners pp
    INNER JOIN propio_partners_users_map partners_map ON pp.partner_id = partners_map.partner_id
    INNER JOIN propio_users pu ON partners_map.user_id = pu.user_id
    WHERE pu.auth0_id = $1`;
    const results = await this.conn.query(query, [auth0UserId]);

    return Number.parseInt(results[0].cnt);
  }

  /**
   * Onboards a new partner to a new or existing organization
   *
   * If the user is already a partner, this will throw an error
   *
   * @param auth0UserId Auth0 user ID of the logged in user
   * @param onboardingRequest Data to onboard the user
   *
   * @returns Partner ID of the newly created partner
   */
  public async onboardPartner(
    auth0UserId: string,
    onboardingRequest: PartnerOnboardingRequest
  ): Promise<number> {
    try {
      logger.debug(`Onboarding user ${auth0UserId} as partner`, {
        request: onboardingRequest,
        auth0UserId: auth0UserId,
      });
      await this.conn.query("BEGIN TRANSACTION", []);
      const newPartnerId = await this.onboardPartnerInternal(
        auth0UserId,
        onboardingRequest
      );
      await this.conn.query("COMMIT TRANSACTION", []);
      logger.debug(`Onboarded user ${auth0UserId} as partner: ${newPartnerId}`);
      return newPartnerId;
    } catch (e) {
      logger.error(`Error onboarding partner: ${e.toString()}`, { error: e });
      await this.conn.query("ROLLBACK TRANSACTION", []);
      throw e;
    }
  }

  private async onboardPartnerInternal(
    auth0UserId: string,
    onboardingRequest: PartnerOnboardingRequest
  ): Promise<number> {
    const existingPartnersCount = await this.countPartnerIdsByAuth0Id(
      auth0UserId
    );
    if (existingPartnersCount > 0) {
      throw Error("User is already a partner");
    }

    // Add the partner to the organization
    const orgName = onboardingRequest.organization.name;
    if (orgName === undefined || orgName === null || orgName.trim() === "") {
      throw Error("Organization name is required");
    }
    let existingOrgId: number;
    try {
      existingOrgId = await this.organizationController.getOrganizationIdByName(
        orgName
      );
    } catch (e) {
      if (e instanceof NotFoundException) {
        // Organization does not exist
        existingOrgId = -1;
      } else {
        throw e;
      }
    }
    // Create a new organization
    if (existingOrgId === -1) {
      // Create the organization
      existingOrgId = await this.organizationController.createOrganization({
        name: orgName,
        logo_url: stringOrUndefined(onboardingRequest.organization.logo_url),
        web_url: stringOrUndefined(onboardingRequest.organization.web_url),
      });
    } else {
      // Organization already exists, update?
    }

    const provisionedEmail = this.generatePartnerSenderEmailAddress(
      onboardingRequest.user
    );

    // Create the partner and associate it with the organization
    const existingUser = await this.usersController.getUserByAuth0Id(
      auth0UserId
    );

    // Create a new partner
    const insertPartnerQuery = `INSERT INTO propio_partners
        (contact_first_name, contact_last_name, contact_email, sender_email, organization_id, onboarded)
      VALUES
        ($1, $2, $3, $4, $5, TRUE) RETURNING partner_id AS id`;
    const insertPartnerResult = await this.conn.execute(insertPartnerQuery, [
      onboardingRequest.user.first_name,
      onboardingRequest.user.last_name,
      onboardingRequest.user.email,
      provisionedEmail,
      existingOrgId,
    ]);

    // Associate the partner with the Auth0 user in the map table
    const mapInsertQuery = `INSERT INTO propio_partners_users_map
        (partner_id, user_id)
      VALUES
        ($1, $2)`;
    await this.conn.execute(mapInsertQuery, [
      insertPartnerResult.lastInsertedId,
      existingUser.propio_user_id,
    ]);

    return insertPartnerResult.lastInsertedId;
  }

  /**
   * Get a partner Id by their Auth0 User ID
   *
   * @param auth0UserId Auth0 User ID
   * @returns Partner ID
   */
  public async getPartnerIdByAuth0Id(auth0UserId: string): Promise<number> {
    const query = `SELECT
        pp.partner_id as partner_id
      FROM propio_partners pp
      INNER JOIN propio_partners_users_map partners_map ON pp.partner_id = partners_map.partner_id
      INNER JOIN propio_users pu ON partners_map.user_id = pu.user_id
      WHERE pu.auth0_id = $1`;
    const results = await this.conn.query(query, [auth0UserId]);
    if (results.length === 0) {
      throw new NotFoundException(`No partner found for user ${auth0UserId}`);
    }
    return Number.parseInt(results[0].partner_id);
  }

  public async findPartnersByEmails(
    searchedPartnerEmails: string[]
  ): Promise<Partner[]> {
    const query = `
            SELECT * FROM propio_partners pp
            WHERE contact_email = ANY($1)
        `;
    const result = await this.conn.query(query, [searchedPartnerEmails]);
    if (result.length == 0) return [];
    return result as Partner[];
  }
}
