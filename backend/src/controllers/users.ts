import { IDatabase } from "../dependencies/database.interface";
import { NotFoundException } from "../dependencies/exceptions";
import { logger } from "../dependencies/logger";
import { User } from "../models/sdk/user";

export class UserController {
  private conn: IDatabase;

  constructor(conn: IDatabase) {
    if (!conn) {
      logger.error("No db connection, failing");
      throw Error("No db connection");
    }
    this.conn = conn;
  }

  /**
   * Get a user by ID
   *
   * @param id The ID of the problem
   */
  public async getUserByAuth0Id(auth0UserId: string): Promise<User> {
    const results = await this.conn.query(
      `SELECT
        pu.user_id,
        pu.auth0_id,
        pu.email,
        pu.picture,
        pu.first_name,
        pu.last_name,
        pumap.partner_id,
        COALESCE(pp.onboarded, FALSE) is_onboarded_as_partner
      FROM propio_users pu
      LEFT OUTER JOIN propio_partners_users_map pumap ON pu.user_id = pumap.user_id
      LEFT OUTER JOIN propio_partners pp ON pumap.partner_id = pp.partner_id
      WHERE pu.auth0_id = $1 LIMIT 1`,
      [auth0UserId]
    );

    if (results.length === 0) {
      throw new NotFoundException("User not found");
    }

    const userResult: User = {
      propio_user_id: results[0].user_id,
      auth0_user_id: results[0].auth0_id,
      email: results[0].email,
      picture: results[0].picture,
      first_name: results[0].first_name,
      last_name: results[0].last_name,
      onboarded: results[0].is_onboarded_as_partner,
      partner_id: results[0].partner_id,
    };
    return userResult;
  }

  public async saveUserByAuth0Id(
    auth0UserId: string,
    userDetails: User
  ): Promise<User> {
    if (!this.conn) {
      logger.error("No db connection, failing");
      throw Error("No db connection");
    }

    const query = `INSERT INTO propio_users
        (auth0_id, first_name, last_name, name, picture, email)
      VALUES
        ($1, $2, $3, $4, $5, $6) RETURNING *`;
    await this.conn.execute(query, [
      auth0UserId,
      userDetails.first_name,
      userDetails.last_name,
      userDetails.first_name,
      userDetails.picture,
      userDetails.email,
    ]);

    const userResult = new Object() as User;
    userResult.auth0_user_id = auth0UserId;

    return userResult;
  }
}
