import { Profile } from "../types/entities/Profile.ts";
import { GroupmeIntegration } from "../types/Groupme.ts";
import { Db } from "../utilities/Database.ts";
import { Dates } from "../utilities/Dates.ts";
import { Errors } from "../utilities/Errors.ts";
import { AsyncResult } from "../utilities/security.ts";

export class Users {
  static async getUsers() {
    const kv = await Db.kv();

    return await Array.fromAsync(kv.list({ prefix: ["users"] }));
  }

  static async getAllProfileRecords(): AsyncResult<
    { profileRecords: Array<Deno.KvEntry<Profile>> }
  > {
    const kv = await Db.kv();

    const allUserRecords = await Array.fromAsync(
      kv.list({ prefix: ["users"] }),
    );
    const profileRecords = allUserRecords.filter((record) =>
      record.key.at(-1) === "profile"
    ) as Array<Deno.KvEntry<Profile>>;

    if (profileRecords.length === 0) {
      return Errors.make("No Profiles found.");
    }

    return { success: true, profileRecords };
  }

  static async getUserProfile(
    userId: string,
  ): AsyncResult<{ profile: Profile }> {
    const kv = await Db.kv();

    const userRecords = await Array.fromAsync(
      kv.list({ prefix: ["users", userId] }),
    );
    const userProfile = userRecords.find((record) =>
      record.key.at(-1) === "profile"
    )?.value as Profile | undefined;

    if (!userProfile) {
      const errors = [];
      !userProfile && errors.push(`No profile found for '${userId}'`);
      return { success: false, errors };
    }

    return { success: true, profile: userProfile };
  }

  static async updateUserProfileGroupme(
    userId: string,
    groupme: GroupmeIntegration,
  ): AsyncResult<{ profile: Profile }> {
    const kv = await Db.kv();
    const profileKey = [
      "users",
      userId,
      "profile",
    ];

    const { value: userProfile } = await kv.get<Profile>(profileKey);
    if (!userProfile) {
      return Errors.make(`User 'profile' record did not exist for '${userId}'`);
    }

    const newProfile: Profile = {
      ...userProfile,
      groupme,
      updatedBy: "system",
      updatedOn: Dates.getNowIso(),
    };

    const profileUpdate = await kv.set(profileKey, newProfile);
    if (!profileUpdate.ok) {
      return Errors.make("Failed to update user 'profile' record");
    }

    return { success: true, profile: newProfile };
  }

  static async deleteUser(
    userId: string,
  ): AsyncResult<{ deletedRecords: unknown[] }> {
    const kv = await Db.kv();

    const userRecords = await Array.fromAsync(
      kv.list({ prefix: ["users", userId] }),
    );
    const userRecordKeys = userRecords.map((record) => record.key);
    const userProfile = userRecords.find((record) =>
      record.key.at(-1) === "profile"
    );
    const { value: profile } = userProfile as Deno.KvEntry<Profile>;
    if (!userProfile) {
      return Errors.make(`User 'profile' record did not exist for '${userId}'`);
    }

    // delete every row found for user id
    const deleteTransaction = kv.atomic();
    for (const key of userRecordKeys) {
      deleteTransaction.delete(key);
    }

    // delete id in groupme lookup table (if exists)
    const groupmeId = profile.groupme?.id;
    let groupmeRecord: Deno.KvEntryMaybe<string> | undefined;
    if (groupmeId) {
      // get groupme record to indicate all deleted records
      const groupmeKey = ["groupmeIds", groupmeId];
      deleteTransaction.delete(groupmeKey);
      groupmeRecord = await kv.get<string>(groupmeKey);
    }

    const deleteResponse = await deleteTransaction
      .commit();
    if (!deleteResponse.ok) {
      return Errors.make(
        `Failed to delete userId '${userId}' records from database.`,
      );
    }

    return {
      success: true,
      deletedRecords: [
        ...userRecords,
        groupmeRecord?.value ? groupmeRecord : "<no groupmeId record found>",
      ],
    };
  }
}
