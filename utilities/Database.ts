import { Profile } from "./security.ts";
const kv = await Deno.openKv();
export class Db {
  static async getUsers() {
    const users = await Array.fromAsync(kv.list({ prefix: ["users"] }));
    return users;
  }
  static async getUsernames() {
    const users = await Array.fromAsync(
      kv.list<string>({ prefix: ["usernames"] }),
    );
    return users;
  }
  static async deleteUser(userId: string) {
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
      // deletes all associated users tables
      .delete(["users", userId])
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
