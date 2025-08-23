import { assertEquals } from "$std/assert/assert_equals.ts";
import { Db } from "../utilities/Database.ts";
import {
  Authentication,
  login,
  Profile,
  signup,
} from "../utilities/security.ts";
import { Errors } from "../utilities/Errors.ts";
import { Test } from "./Test.ts";
Deno.test({
  name: "signing up creates a user and user can be delted",
  fn: Test.runInTempDb(async () => {
    const username = "testUser";
    const password = "some!c🤔mpl33#x+@ssword```~";
    const signupResult = Errors.checkResult(
      await signup(username, password),
      "sign up not successful",
    );
    Test.guid(signupResult.userId);
    // check username is in username table
    const userIdResult = Errors.checkResult(
      await Db.getUserId(username),
      "get userId not successful",
    );
    assertEquals(
      userIdResult.userId,
      signupResult.userId,
      "userId in username table is not equal to userId from signup",
    );
    // get user information
    const userResult = Errors.checkResult(
      await Db.getUser(userIdResult.userId),
      "get userId not successful",
    );
    assertEquals(
      userResult.profile.username,
      username,
      "profile username is not equal to given username for signup",
    );
    // check if deleting user works
    const deleteResult = Errors.checkResult(
      await Db.deleteUser(userIdResult.userId),
      "failed to delete user",
    );
    assertEquals(
      deleteResult.deletedRecords.length,
      3,
      "authenticaion, profile, and username row should have been deleted",
    );
    assertEquals<Authentication>(
      userResult.authentication,
      (deleteResult.deletedRecords[0] as Deno.KvEntry<Authentication>).value,
      "authentication record does match what was deleted",
    );
    assertEquals<Profile>(
      userResult.profile,
      (deleteResult.deletedRecords[1] as Deno.KvEntry<Profile>).value,
      "profile record does match what was deleted",
    );
    assertEquals<string>(
      userIdResult.userId,
      (deleteResult.deletedRecords[2] as Deno.KvEntry<string>).value,
      "deleted username id does not match user id",
    );
  }),
});
Deno.test({
  name: "can sign up user and login with password",
  fn: Test.runInTempDb(async () => {
    const username = "testUser";
    const password = "some!c🤔mpl33#x+@ssword```~";
    const { userId } = Errors.checkResult(
      await signup(username, password),
      "sign up not successful",
    );
    // attempt to login after creating profile
    const { sessionId } = Errors.checkResult(
      await login(username, password),
      "login not successful",
    );
    // got session id logging in
    Test.guid(sessionId);
    // session is in db
    Errors.checkResult(
      await Db.getSession(sessionId),
      "Session was not in db",
    );
    // one session is associated with the user
    const { sessions } = Errors.checkResult(
      await Db.getUserSessions(userId),
      "failed to get sessions for user",
    );
    assertEquals(sessions.length, 1);
    // signing in again has two sessions
    Errors.checkResult(
      await login(username, password),
      "second login not successful",
    );
    const { sessions: sessions2 } = Errors.checkResult(
      await Db.getUserSessions(userId),
      "failed to get sessions for user the second time",
    );
    assertEquals(sessions2.length, 2);
    // first session matches in both session results
    assertEquals(sessions[0], sessions2[0]);
  }),
});
