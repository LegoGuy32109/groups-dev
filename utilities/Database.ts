import { AsyncResult, Authentication, Profile } from "./security.ts";
interface DbOptions {
  test?: boolean;
  path?: string;
}
export class Db {
  private static _kv: Deno.Kv | null = null;
  /**
  * Closes current connection and created one with given options
  */
  static async configure(options: DbOptions = {}) {
    Db.close();
    Db._kv = await Deno.openKv(options.test ? ":memory:" : options.path);
  }
  /**
  * Will need to be reconfigured after close
  */
  static close() {
    if (Db._kv) Db._kv.close();
    Db._kv = null;
  }
  static async kv(): Promise<Deno.Kv> {
    if (Db._kv) {
      return Db._kv;
    }
    // if it wasn't already configured, give default
    return await Deno.openKv();
  }
  static async getUsers() {
    const kv = await Db.kv();
    const users = await Array.fromAsync(kv.list({ prefix: ["users"] }));
    return users;
  }
  static async getUsernames() {
    const kv = await Db.kv();
    const users = await Array.fromAsync(
      kv.list<string>({ prefix: ["usernames"] }),
    );
    return users;
  }
  static async getUserId(username: string): AsyncResult<{ userId: string }> {
    const kv = await Db.kv();
    const userId = (await kv.get<string>(["usernames", username])).value;
    if (!userId) {
      return { success: false, errors: [`No userId found for ${username}`] };
    }
    return { success: true, userId };
  }
  static async getUser(
    userId: string,
  ): AsyncResult<{ profile: Profile; authentication: Authentication }> {
    const kv = await Db.kv();
    const userRecords = await Array.fromAsync(
      kv.list({ prefix: ["users", userId] }),
    );
    const userProfile = userRecords.find((record) =>
      record.key.at(-1) === "profile"
    )?.value as Profile | undefined;
    const userAuth = userRecords.find((record) => record.key.at(-1) === "auth")
      ?.value as Authentication | undefined;
    if (!userProfile || !userAuth) {
      const errors = [];
      !userProfile && errors.push(`No profile found for '${userId}'`);
      !userAuth && errors.push(`No authentication found for '${userId}'`);
      return { success: false, errors };
    }
    return { success: true, profile: userProfile, authentication: userAuth };
  }
  static async deleteUser(userId: string) {
    const kv = await Db.kv();
    const userRecords = await Array.fromAsync(
      kv.list({ prefix: ["users", userId] }),
    );
    const userProfile = userRecords.find((record) =>
      record.key.at(-1) === "profile"
    )?.value as Profile;
    if (!userProfile) {
      return {
        success: false,
        errors: [`User 'profile' record did not exist for '${userId}'`],
      };
    }
    // delete username in username lookup table
    const username = userProfile.username;
    const deleteResponse = await kv.atomic()
      .delete(["usernames", username])
      .delete(["users", userId, "auth"])
      .delete(["users", userId, "profile"])
      .commit();
    if (!deleteResponse.ok) {
      return {
        success: false,
        errors: [
          `Failed to delete both username '${username}' and userId '${userId}' from database.`,
        ],
      };
    }
    return { success: true };
  }
  static async deleteAllDataInTable(table: string) {
    const kv = await Db.kv();
    const iter = kv.list({ prefix: [table] });
    const deletes: Promise<void>[] = [];
    for await (const entry of iter) {
      deletes.push(kv.delete(entry.key));
    }
    await Promise.all(deletes);
  }
  static async deleteAllDataInDb() {
    await Promise.all([
      this.deleteAllDataInTable("users"),
      this.deleteAllDataInTable("usernames"),
    ]);
  }
}
