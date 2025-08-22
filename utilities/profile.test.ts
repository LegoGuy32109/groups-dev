import { assertEquals } from "$std/assert/assert_equals.ts";
import { Db } from "../utilities/Database.ts";
import { signup } from "../utilities/security.ts";
import { Errors } from "../utilities/Errors.ts";
Deno.test({
  name: "signing up creates a user",
  async fn() {
    // give us a clean slate to test
    await Db.configure({ test: true });
    const username = "josh";
    const password = "hale";
    const signupResult = Errors.checkResult(
      await signup(username, password),
      "sign up not successful",
    );
    // check userId is guid
    const parts = signupResult.userId.split("-");
    assertEquals(parts.length, 5, "id not comprised of 4 dashes '-'");
    const [p1, p2, p3, p4, p5] = parts;
    assertEquals(
      p1.length,
      8,
      `part 1 of id not 8 characters long, got: ${p1}`,
    );
    assertEquals(
      p2.length,
      4,
      `part 2 of id not 4 characters long, got: ${p2}`,
    );
    assertEquals(
      p3.length,
      4,
      `part 3 of id not 4 characters long, got: ${p3}`,
    );
    assertEquals(
      p4.length,
      4,
      `part 4 of id not 4 characters long, got: ${p4}`,
    );
    assertEquals(
      p5.length,
      12,
      `part 5 of id not 12 characters long, got: ${p5}`,
    );
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
    // close database at end of test
    Db.close();
  },
});
