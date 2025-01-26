import { logger } from "../dependencies/logger";
import { ForbiddenException } from "../dependencies/exceptions";
import { OrganizationsController } from "../controllers/organizations";

/**
 * Returns wether the provided user is an admin of a given project.
 * Users may directly be project admins, but they may also have
 * access via an organization. Users in an organization have
 * admin privileges on all projects in that organizaiton.
 *
 * @param db An instance to the database layer
 * @param userId The user to check.
 * @param projectId The project to check.
 * @returns True if user is admin of project.
 */
export async function isUserProjectAdmin(db, userId, projectId) {
  // direct access
  const isAdminQuery = `select count(*) as isAdmin from project_user_admin where project_id = ? and user_id = ?; `;
  let { rows } = await db.execute(isAdminQuery, [projectId, userId]);
  if (rows.length === 1 && rows[0].isAdmin === 1) {
    return true;
  }

  // access through an organization
  const orgQuery = `SELECT * FROM project
                    RIGHT JOIN user_organization ON project.organization_id = user_organization.organization_id
                    WHERE user_organization.user_id=? AND project.id=?;`;

  ({ rows } = await db.execute(orgQuery, [userId, projectId]));
  return rows.length >= 1;
}

/**
 * Determines whether the given user is a global admin; throws a
 * ForbiddenException if the user is not a global admin.
 *
 * Optionally, you may include a message for the error that is thrown
 * if the provided user is not a global admin.
 *
 * @param db An instance to the database layer
 * @param userId The user to check.
 * @param unauthorizedMessage A message inside the Unauthorized exception.
 */
export async function requireGlobalAdmin(
  db,
  userId: string,
  unauthorizedMessage = `It was expected that user ${userId} was a global admin but they are not.`
) {
  const isGlobalAdmin = await isUserGlobalAdmin(db, userId);
  if (!isGlobalAdmin) {
    throw new ForbiddenException(unauthorizedMessage);
  }
}

/**
 * Returns whether or not the given user (if one is provided) is a global admin
 *
 * @param db An instance to the database layer
 * @param userId The user to check.
 * @returns True if user is global admin.
 */
export async function isUserGlobalAdmin(db, userId: string | null) {
  if (!userId) return false;
  const { rows } = await db.query("SELECT role FROM user WHERE id = ?", [
    userId,
  ]);
  if (rows.length === 0 || rows[0].role !== "admin") {
    logger.info(`User ${userId} is not a global admin.`);
    return false;
  }

  logger.info(`User ${userId} has global admin permissions.`);
  return true;
}

/**
 * Returns wether the user can read a problem. Either because the problem is public,
 * the user is an admin of the problem, or the user is a candidate in a project that
 * contains this problem.
 *
 * @param db An instance to the database layer
 * @param userId The user to check.
 * @param problemId The problem to check
 * @param projectId The optional project
 * @returns
 */
export async function userCanGetProblem(
  db,
  userId: string,
  problemId: number,
  projectId: number | null = null
) {
  // if the user is a global admin, they can access the problem
  const isCurrentUserAdmin = await isUserGlobalAdmin(db, userId);
  if (isCurrentUserAdmin) {
    return true;
  }

  const { rows } = await db.execute(
    "SELECT * FROM problem WHERE id = ? AND deleted = 0",
    [problemId]
  );
  const problemFromDB = rows[0];

  // anyone can access public problems
  if (problemFromDB?.public === 1) {
    return true;
  }

  // if within project context, userId must be a candidate or admin of the project
  const isProjectAdmin = await isUserProjectAdmin(db, userId, projectId);
  if (projectId && isProjectAdmin) {
    return true;
  }

  // if outside project context, user must be problem admin
  const isProblemAdmin = await isUserProblemAdmin(db, userId, problemId);
  if (isProblemAdmin) {
    return true;
  }

  // all other cases: no access
  return false;
}

/*
 * Attempts to parse and return the current user's id from the decoded JWT.
 * If a user ID is not found in the requestEvent, returns null.
 **/
export function tryGetUserId(requestEvent): string | null {
  let currentUserId: string | null = null;
  try {
    currentUserId = requestEvent.requestContext.authorizer.jwt.claims.sub;
  } catch (e) {
    logger.info("No user ID found in JWT claim. Proceeding with null id.");
  }
  return currentUserId;
}

/*
 * Gets the current user's id from the decoded JWT.
 * If a user ID is not found in the requestEvent,
 * throws an error.
 **/
export function requireUserId(requestEvent): string {
  try {
    // return the user id
    return requestEvent.requestContext.authorizer.jwt.claims.sub;
  } catch (e) {
    logger.error("No user ID found in JWT when one was expected.");
    throw new ForbiddenException();
  }
}

/**
 * Note on this function. When a user creates a problem, they are assigned as the owner,
 * but they are also inserted as a problem_admin.
 */
export async function isUserProblemAdmin(db, userId, problemId) {
  const isAdminQuery = `SELECT * FROM problem_admin WHERE problem_id = ? AND user_id = ?`;
  let { rows } = await db.execute(isAdminQuery, [problemId, userId]);
  if (rows.length > 0) {
    return true;
  }

  // access through an organization
  const orgQuery = `SELECT * FROM problem
                    RIGHT JOIN user_organization ON problem.organization_id = user_organization.organization_id
                    WHERE user_organization.user_id=? AND problem.id=?;`;

  ({ rows } = await db.execute(orgQuery, [userId, problemId]));
  return rows.length >= 1;
}

/**
 * Returns whether the given user is part of the given organization
 *
 * @param db An instance to the database layer
 * @param userId User ID of the user to check
 * @param organizationId ID of the organization to check
 * @returns True if the user is part of the given organization, false otherwise
 */
export async function isUserInOrganization(
  db,
  userId: string,
  organizationId: number
): Promise<boolean> {
  const orgController = new OrganizationsController(db);
  return orgController.isUserInOrganization(userId, organizationId);
}
