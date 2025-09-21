// import { Db } from "../utilities/Database.ts";
// import { login, logout, signup } from "../utilities/security.ts";
// import { Errors } from "../utilities/Errors.ts";
// import { Test } from "./testUtils.ts";
// import { assert, assertEquals, assertNotEquals } from "@std/assert";

// Deno.test({
//   name: "signing up creates a user and user can be delted",
//   fn: Test.runInTempDb(async () => {
//     const username = "testUser";
//     const password = "some!c🤔mpl33#x+@ssword```~";
//     const signupResult = Errors.checkResult(
//       await signup(username, password),
//       "sign up not successful",
//     );
//     Test.guid(signupResult.userId);
//
//     // check username is in username table
//     const userIdResult = Errors.checkResult(
//       await Db.getUserIdFromUsername(username),
//       "get userId not successful",
//     );
//     assertEquals(
//       userIdResult.userId,
//       signupResult.userId,
//       "userId in username table is not equal to userId from signup",
//     );
//
//     // get user information
//     const userResult = Errors.checkResult(
//       await Db.getUserProfile(userIdResult.userId),
//       "get userId not successful",
//     );
//     assertEquals(
//       userResult.profile.username,
//       username,
//       "profile username is not equal to given username for signup",
//     );
//
//     // check if deleting user works
//     const deleteResult = Errors.checkResult(
//       await Db.deleteUser(userIdResult.userId),
//       "failed to delete user",
//     );
//     assertEquals(
//       deleteResult.deletedRecords.length,
//       3,
//       "authenticaion, profile, and username row should have been deleted",
//     );
//     assertEquals<Authentication>(
//       userResult.authentication,
//       (deleteResult.deletedRecords[0] as Deno.KvEntry<Authentication>).value,
//       "authentication record does match what was deleted",
//     );
//     assertEquals<Profile>(
//       userResult.profile,
//       (deleteResult.deletedRecords[1] as Deno.KvEntry<Profile>).value,
//       "profile record does match what was deleted",
//     );
//     assertEquals<string>(
//       userIdResult.userId,
//       (deleteResult.deletedRecords[2] as Deno.KvEntry<string>).value,
//       "deleted username id does not match user id",
//     );
//   }),
// });

// Deno.test({
//   name: "can sign up user and login with password",
//   fn: Test.runInTempDb(async () => {
//     const username = "testUser";
//     const password = "some!c🤔mpl33#x+@ssword```~";
//     const { userId } = Errors.checkResult(
//       await signup(username, password),
//       "sign up not successful",
//     );
//
//     // attempt to login after creating profile
//     const { sessionId } = Errors.checkResult(
//       await login(username, password),
//       "login not successful",
//     );
//
//     // got session id logging in
//     Test.guid(sessionId);
//
//     // session is in db
//     Errors.checkResult(
//       await Db.getSession(sessionId),
//       "Session was not in db",
//     );
//
//     // one session is associated with the user
//     const { sessions } = Errors.checkResult(
//       await Db.getUserSessions(userId),
//       "failed to get sessions for user",
//     );
//     assertEquals(sessions.length, 1);
//
//     // signing in again has two sessions
//     Errors.checkResult(
//       await login(username, password),
//       "second login not successful",
//     );
//     const { sessions: sessions2 } = Errors.checkResult(
//       await Db.getUserSessions(userId),
//       "failed to get sessions for user the second time",
//     );
//     assertEquals(sessions2.length, 2);
//
//     // first session matches in both session results
//     assertEquals(sessions[0], sessions2[0]);
//   }),
// });

// Deno.test({
//   name:
//     "can sign up user and login twice, logging out keeps one session active",
//   fn: Test.runInTempDb(async () => {
//     const username = "testUser";
//     const password = "some!c🤔mpl33#x+@ssword```~";
//     const { userId } = Errors.checkResult(
//       await signup(username, password),
//       "sign up not successful",
//     );
//
//     // login twice
//     const { sessionId } = Errors.checkResult(
//       await login(username, password),
//       "login not successful",
//     );
//
//     // grab that session for checking later
//     const { session } = Errors.checkResult(
//       await Db.getSession(sessionId),
//       "failed to get session from database",
//     );
//     const { sessionId: sessionId2 } = Errors.checkResult(
//       await login(username, password),
//       "2nd login not successful",
//     );
//     assertNotEquals(
//       sessionId,
//       sessionId2,
//       "returned identical id for two seperate login sessions",
//     );
//
//     // confirm session records are accurate
//     const { sessions } = Errors.checkResult(
//       await Db.getUserSessions(userId),
//       "failed to get sessions for user",
//     );
//     assertEquals(sessions.length, 2);
//     const { deletedSession, userSessionIds } = Errors.checkResult(
//       await logout(sessionId),
//       "failed to log out first session",
//     );
//     assertEquals(
//       session,
//       deletedSession,
//       "deleted session does not match session with same id",
//     );
//     assert(
//       userSessionIds.every((id) => id !== sessionId),
//       "session id was in user sessions after deletion",
//     );
//
//     // confirm there's only one session now for user
//     const { sessions: sessions2 } = Errors.checkResult(
//       await Db.getUserSessions(userId),
//       "failed to get sessions for user",
//     );
//     assertEquals(sessions2.length, 1);
//   }),
// });
