import { IDatabase } from "../dependencies/database.interface";
import { Organization } from "../models/backend/models";
import { NotFoundException } from "../dependencies/exceptions";

export class OrganizationsController {
  private conn: IDatabase;

  constructor(conn: IDatabase) {
    if (!conn) {
      throw new Error("No DB instance provided");
    }
    this.conn = conn;
  }

  /**
   * Returns whether the given user is part of the given organization
   *
   * @param db An instance to the database layer
   * @param userId User ID of the user to check
   * @param organizationId ID of the organization to check
   * @returns True if the user is part of the given organization, false otherwise
   */
  public async isUserInOrganization(
    userId: string,
    organizationId: number
  ): Promise<boolean> {
    const rows = await this.conn.query(
      "SELECT * FROM user_organization WHERE user_id = ? AND organization_id = ?",
      [userId, organizationId]
    );

    return rows.length > 0;
  }

  /**
   * Creates a new organization in the database
   *
   * @param organization Organization object to create
   * @returns The ID of the newly created organization
   */
  public async createOrganization({
    name,
    logo_url,
    web_url,
    industry,
  }: Organization): Promise<number> {
    const query = `INSERT INTO propio_organizations (name, logo_url, web_url, industry) VALUES ($1, $2, $3, $4) RETURNING organization_id as id`;
    const result = await this.conn.execute(query, [
      name,
      logo_url,
      web_url,
      industry,
    ]);
    return result.lastInsertedId;
  }

  /**
   * Get an organization in the database based on organization_id
   *
   * @param organization_id Organization id
   * @returns organization of targeted organization_id
   */
  public async getOrganizationById(
    organization_id: number
  ): Promise<Organization> {
    const query = `SELECT
      organization_id, name, logo_url, web_url, industry
    FROM propio_organizations WHERE organization_id = $1 LIMIT 1`;
    const result = await this.conn.query(query, [organization_id]);

    if (result.length === 0) {
      throw new NotFoundException("Organization not found");
    }

    return {
      organization_id: result[0].organization_id,
      name: result[0].name,
      logo_url: result[0].logo_url,
      web_url: result[0].web_url,
      industry: result[0].industry,
    };
  }

  /**
   * Finds an organization by its name, case-insensitive
   *
   * @param name Name of the organization to search for
   * @returns The ID of the organization
   *
   * @throws NotFoundException if the organization is not found
   * @throws Error if multiple organizations are found with the same name
   */
  public async getOrganizationIdByName(name: string): Promise<number> {
    const query = `SELECT organization_id as id FROM propio_organizations WHERE lower(name) = lower($1)`;
    const results = await this.conn.query(query, [name]);

    if (results.length === 0) {
      throw new NotFoundException("Organization not found");
    }
    if (results.length > 1) {
      throw Error("Multiple organizations found with the same name");
    }

    return results[0].id;
  }

  /**
   * Finds an organization by partner_id, case-insensitive
   *
   * @param partner_id id of partner affiliated with this organization to search for
   * @returns organization of targeted partner_id
   *
   * @throws NotFoundException if the organization is not found
   */
  public async getOrganizationsByPartnerId(
    partnerId: number
  ): Promise<Organization[]> {
    const query = `SELECT *
        FROM propio_partners pp
        INNER JOIN propio_organizations po ON pp.organization_id = po.organization_id
        WHERE pp.partner_id = $1`;

    const results = await this.conn.query(query, [partnerId]);
    if (results.length === 0) {
      throw new NotFoundException(
        `No organizations  found for partner ${partnerId}`
      );
    }

    return results.map((row) => ({
      organization_id: row.organization_id,
      name: row.name,
      web_url: row.web_url || undefined,
      logo_url: row.logo_url,
      industry: row.industry,
    }));
  }

  /**
   * Edit an organization
   *
   * @param Organization Organization data
   * @param organizationId Organization id
   *
   * @returns ID of the edited Organization
   */
  public async editOrganization(
    body: Organization,
    organizationId: number
  ): Promise<number> {
    if (!organizationId) {
      throw new Error("Organization ID is required");
    }

    const query = `
        UPDATE propio_organizations
        SET web_url = $1,
            logo_url = $2,
            name = $3,
            industry = $4
        WHERE organization_id = $5
        RETURNING organization_id`;

    const values = [
      body.web_url,
      body.logo_url,
      body.name,
      body.industry,
      organizationId,
    ];

    const result = await this.conn.query(query, values);
    return result[0].organization_id;
  }

  /**
   * Gets all users that are part of the requested organization. If the organization
   * has been soft-deleted, no members are returned.
   * @param id Id of the organization to query
   * @returns all users that are part of this organization, or [] if the organization is deleted
   */
  //public async getOrganizationMembers(id: number): Promise<GetUsers[]> {
  //  const { rows } = await this.conn.execute(
  //    `SELECT user.id, user.name, user.role, user.username, user.email, user.github, user.date_created FROM user_organization
  //     LEFT JOIN user ON user.id = user_organization.user_id
  //     LEFT JOIN organization on user_organization.organization_id = organization.id
  //     WHERE user_organization.organization_id = ? and organization.deleted = 0`,
  //    [id]
  //  );

  //  return rows as GetUsers[];
  //}
}
