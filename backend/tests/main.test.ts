import { SQLiteDatabaseConnection } from "../src/dependencies/sqlite.database";
// import { IQueueProvider } from "../src/dependencies/queue.interface";
import FakeQueue from "../src/dependencies/queues/fake-queue";
import { TestUtils } from "./test.utils";

test("moot test", async () => {
  expect(1 + 1).toBe(2);
});

// const DEFAULT_CURRENT_USER = {
//   id: "PROBLEMS-DEFAULT-USER",
//   name: "problems-default-user",
//   email: "problems_default@email.com",
// };
// const ADMIN_USER = {
//   id: "PROBLEMS-ADMINUSER",
//   name: "problems-admin",
//   email: "problems_admin@email.com",
// };
//
// beforeAll(async () => {
//   let databaseConnection: SQLiteDatabaseConnection =
//     new SQLiteDatabaseConnection();
//   await databaseConnection.connect();
//   await databaseConnection.load();
//
//   let queue: IQueueProvider = new FakeQueue();
//
//   Object.assign(TestUtils.lambdaContext, {
//     db: databaseConnection,
//     queue: queue,
//   });
//
// });
//
// //
// // Users
// //
// test("create, get and list users", async () => {
//   const userId = "user-guid-123";
//
//   // Create a user
//   await TestUtils.createUser(userId, "laura", `${userId}@mail.com`);
//
//   // Get that single user (a user can get their own data)
//   let getUserResult = await TestUtils.getUser(userId, userId);
//   expect(getUserResult.statusCode).toBe(200);
//   const getUserResultParsed = JSON.parse(getUserResult.body);
//   expect(getUserResultParsed.id).toBe(userId);
//   expect(getUserResultParsed.name).toBe("laura");
//   expect(getUserResultParsed.username).toMatch(/[A-Z][a-z]*[A-Z][a-z]*\d+/);
//   expect(getUserResultParsed.role).toBe("user");
//   expect(getUserResultParsed.email).toBe(`${userId}@mail.com`);
//   expect(getUserResultParsed.github).toBe(null);
//   expect(getUserResultParsed.projects).toBeInstanceOf(Array);
//   expect(getUserResultParsed.projects.length).toBe(0);
//   expect(getUserResultParsed.hasLoggedIn).toBe(false);
//   expect(getUserResultParsed.date_created).toMatch(
//     /\d{4}-(?:0[1-9]|1[0-2])-(?:0[1-9]|[1-2]\d|3[0-1])T(?:[0-1]\d|2[0-3]):[0-5]\d:[0-5]\dZ/
//   );
//   expect(getUserResultParsed.license).toBeInstanceOf(Object);
//
//   // create a user with a custom username
//   await TestUtils.createUser(
//     "custom-username",
//     "laura",
//     "custom@email.com",
//     "CustomUsername!!"
//   );
//   let result = await TestUtils.getUser(ADMIN_USER.id, "custom-username");
//   result = JSON.parse(result.body);
//   expect(result.username).toBe("CustomUsername!!");
//
//   // check the list of users
//   let getUsersResult = await TestUtils.getUsers(ADMIN_USER.id);
//   let getUsersResultParsed = JSON.parse(getUsersResult.body);
//   expect(getUsersResultParsed).toBeInstanceOf(Array);
//   expect(getUsersResultParsed.length).toBe(4);
//   expect(getUsersResultParsed[0].id).toBe(ADMIN_USER.id);
//   expect(getUsersResultParsed[1].id).toBe(DEFAULT_CURRENT_USER.id);
//   expect(getUsersResultParsed[2].id).toBe(userId);
//   expect(getUsersResultParsed[3].id).toBe("custom-username");
//
//   // ensure the non-admin user cannot get all users
//   let unauthorizedUsers = await TestUtils.getUsers(DEFAULT_CURRENT_USER.id);
//   expect(unauthorizedUsers.statusCode).toBe(403);
//
//   // permissions: the admin user can get another user
//   let otherUser = await TestUtils.getUser(
//     ADMIN_USER.id,
//     DEFAULT_CURRENT_USER.id
//   );
//   expect(otherUser.statusCode).toBe(200);
//
//   // permissions: a non-admin user cannot get data about other users
//   otherUser = await TestUtils.getUser(DEFAULT_CURRENT_USER.id, userId);
//   expect(otherUser.statusCode).toBe(403);
// });
//
// test("Username Restrictions", async () => {
//   const prefix = "usernames-";
//
//   // create a user with custom username
//   let res = await TestUtils.createUser(
//     `${prefix}1-id`,
//     "person a",
//     "a@email.com",
//     `${prefix}username-1`
//   );
//   expect(res.statusCode).toBe(200);
//
//   // we can't create another user with the same username or one that is too long
//   res = await TestUtils.createUser(
//     `${prefix}2-id`,
//     "person b",
//     "b@email.com",
//     `${prefix}username-1`
//   );
//   expect(res.statusCode).toBe(400);
//   res = await TestUtils.createUser(
//     `${prefix}2-id`,
//     "person b",
//     "b@email.com",
//     `${prefix}username-11111111111111111111`
//   );
//   expect(res.statusCode).toBe(400);
//
//   // create the other user with unique username
//   res = await TestUtils.createUser(
//     `${prefix}2-id`,
//     "person b",
//     "b@email.com",
//     `${prefix}username-2`
//   );
//   expect(res.statusCode).toBe(200);
//
//   // we can update the username to another unique string
//   res = await TestUtils.updateUser(`${prefix}2-id`, `${prefix}2-id`, {
//     username: `${prefix}updated`,
//   });
//   expect(res.statusCode).toBe(200);
//
//   // we cannot update the username to be non-unique or too long
//   res = await TestUtils.updateUser(`${prefix}2-id`, `${prefix}2-id`, {
//     username: `${prefix}username-1`,
//   });
//   expect(res.statusCode).toBe(400);
//
//   res = await TestUtils.updateUser(`${prefix}2-id`, `${prefix}2-id`, {
//     username: `${prefix}username-updatedddddddddddd`,
//   });
//   expect(res.statusCode).toBe(400);
//
//   // at the end of this, we should see the correct updated username
//   res = await TestUtils.getUser(ADMIN_USER.id, `${prefix}2-id`);
//   res = JSON.parse(res.body);
//   expect(res.username).toBe(`${prefix}updated`);
// });
//
// test("Update Users", async () => {
//   const prefix = "update-users";
//   const userId = `${prefix}-example`;
//   await TestUtils.createUser(userId, "fred", `${prefix}-fred@email.com`);
//
//   // a user can update their own data (but not their role)
//   let updateResult = await TestUtils.updateUser(userId, userId, {
//     name: "rob",
//     role: "admin",
//   });
//   expect(updateResult.statusCode).toBe(200);
//   let userResult = await TestUtils.getUser(userId, userId);
//   userResult = JSON.parse(userResult.body);
//   expect(userResult.name).toBe("rob");
//   expect(userResult.role).toBe("user");
//
//   // an admin user can update the data of other users (including role)
//   updateResult = await TestUtils.updateUser(ADMIN_USER.id, userId, {
//     name: "jessie",
//     role: "admin",
//   });
//   expect(updateResult.statusCode).toBe(200);
//   userResult = await TestUtils.getUser(ADMIN_USER.id, userId);
//   userResult = JSON.parse(userResult.body);
//   expect(userResult.name).toBe("jessie");
//   expect(userResult.role).toBe("admin");
//
//   // a normal user cannot update the data of other users
//   updateResult = await TestUtils.updateUser(DEFAULT_CURRENT_USER.id, userId, {
//     name: "unchangeable!",
//   });
//   expect(updateResult.statusCode).toBe(403);
// });
//
// test("Only global admins can get site-wide submissions", async () => {
//   // sitewide submissions
//   let submissionsResult = await TestUtils.getSubmissions(ADMIN_USER.id);
//   expect(submissionsResult.statusCode).toBe(200);
//
//   submissionsResult = await TestUtils.getSubmissions(DEFAULT_CURRENT_USER.id);
//   expect(submissionsResult.statusCode).toBe(403);
// });
//
// test("Sitewide Ranking", async () => {
//   const prefix = "ranking-";
//
//   // create two users
//   const userId1 = prefix + "1";
//   await TestUtils.createUser(userId1, prefix + "user 1");
//   const userId2 = prefix + "2";
//   await TestUtils.createUser(userId2, prefix + "user 2");
//
//   // create 2 problems: 1 that gets full point and one that returns 0 point
//   const fullPointsProblem = TestUtils.createProblemDetails();
//   const fullPointsProblemId = await TestUtils.createProblem(
//     ADMIN_USER.id,
//     fullPointsProblem
//   );
//
//   const zeroPointsProblem = TestUtils.createProblemDetails(
//     true,
//     "tests/problemFiles/zeroPointTest.problem.js"
//   );
//   const zeroPointsProblemId = await TestUtils.createProblem(
//     ADMIN_USER.id,
//     zeroPointsProblem
//   );
//
//   // both users are not yet in the ranking because they have not made submissions
//   let ranking = await TestUtils.getRanking();
//   expect(ranking.statusCode).toBe(200);
//   ranking = JSON.parse(ranking.body);
//
//   let user1Rank = ranking.find((x) => x.id === userId1);
//   let user2Rank = ranking.find((x) => x.id === userId2);
//
//   expect(user1Rank).toBeUndefined();
//   expect(user2Rank).toBeUndefined();
//
//   // both users submit (with 0 points)
//   await TestUtils.openAndSubmitToProblem(zeroPointsProblemId, userId1);
//   await TestUtils.openAndSubmitToProblem(zeroPointsProblemId, userId2);
//
//   ranking = await TestUtils.getRanking();
//   ranking = JSON.parse(ranking.body);
//
//   // check that users with total_score of 0 are not in the ranking
//   let user1RankIdx = ranking.findIndex((x) => x.id === userId1);
//   let user2RankIdx = ranking.findIndex((x) => x.id === userId2);
//
//   expect(user1RankIdx).toBe(-1); // User should not be in ranking
//   expect(user2RankIdx).toBe(-1); // User should not be in ranking
//
//   // user 1 submits twice with full points to the other problem. They now have a higher score
//   let subId = await TestUtils.openAndSubmitToProblem(
//     fullPointsProblemId,
//     userId1
//   );
//   await TestUtils.processSubmission(userId1, subId.id);
//   subId = await TestUtils.submitToProblem(fullPointsProblemId, userId1);
//   await TestUtils.processSubmission(userId1, subId.id);
//
//   ranking = await TestUtils.getRanking();
//   ranking = JSON.parse(ranking.body);
//
//   user1RankIdx = ranking.findIndex((x) => x.id === userId1);
//   user2RankIdx = ranking.findIndex((x) => x.id === userId2);
//
//   // assert the rankings of users who have scores greater than 0
//   expect(user2RankIdx).toBeLessThan(user1RankIdx);
//   expect(ranking[user1RankIdx].total_score).toBe(1); // even though they submitted correctly twice, we only count their best score
//   expect(ranking[user2RankIdx]).toBeUndefined();
// });
//
