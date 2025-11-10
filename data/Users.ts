import { Credential } from "../types/entities/Credential.ts";
import { Profile } from "../types/entities/Profile.ts";
import { GroupmeIntegration } from "../types/Groupme.ts";
import { Db } from "../utilities/Database.ts";
import { Dates } from "../utilities/Dates.ts";
import { AsyncResult, Errors } from "../utilities/Errors.ts";

export class Users {
  static async getAll() {
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

    return { ok: true, profileRecords };
  }

  static async setCredential(
    userId: string,
    credential: PublicKeyCredentialJSON,
    updatedBy?: string,
  ): AsyncResult {
    const kv = await Db.kv();
    const credentialKey = [
      "users",
      userId,
      "credentials",
      credential.id,
    ];
    const credentialLookupKey = [
      "credentials",
      credential.id,
    ];

    const now = Dates.getNowIso();
    const credentialEntity: Credential = {
      credential,
      createdBy: updatedBy ?? userId,
      updatedBy: updatedBy ?? userId,
      createdOn: now,
      updatedOn: now,
    };

    const createCredentialResponse = await kv.atomic()
      .check({ key: credentialKey, versionstamp: null })
      .check({ key: credentialLookupKey, versionstamp: null })
      .set(credentialKey, credentialEntity)
      .set(credentialLookupKey, userId)
      .commit();

    if (!createCredentialResponse.ok) {
      return Errors.make("Failed to create Credential. Try again.");
    }

    return { ok: true };
  }

  static async getCredential(
    credentialId: string,
  ): AsyncResult<{ credential: PublicKeyCredentialJSON }> {
    const kv = await Db.kv();
    const credentialLookupKey = [
      "credentials",
      credentialId,
    ];
    const { value: userId } = await kv.get<string>(
      credentialLookupKey,
    );
    if (!userId) {
      return Errors.make(
        `Failed to find user associated with credential id '${credentialId}'`,
      );
    }

    const credentialKey = [
      "users",
      userId,
      "credentials",
      credentialId,
    ];

    const { value: credential } = await kv.get<PublicKeyCredentialJSON>(
      credentialKey,
    );

    if (!credential) {
      return Errors.make(`Failed to find credential with id '${credentialId}'`);
    }

    return { ok: true, credential };
  }

  static async getProfile(
    userId: string,
  ): AsyncResult<{ profile: Profile; entityKey: Deno.KvKey }> {
    const kv = await Db.kv();
    const profileKey = [
      "users",
      userId,
      "profile",
    ];

    const { value: userProfile, key } = await kv.get<Profile>(profileKey);

    if (!userProfile) {
      return Errors.make(`No profile found for '${userId}'`);
    }

    return { ok: true, profile: userProfile, entityKey: key };
  }

  static async updateProfileGroupme(
    userId: string,
    groupme: GroupmeIntegration,
  ): AsyncResult<{ profile: Profile }> {
    const kv = await Db.kv();
    const profileResult = await Users.getProfile(userId);
    if (!profileResult.ok) return profileResult;
    const { profile, entityKey } = profileResult;

    const newProfile: Profile = {
      ...profile,
      groupme,
      updatedBy: "system",
      updatedOn: Dates.getNowIso(),
    };

    const profileUpdate = await kv.set(entityKey, newProfile);
    if (!profileUpdate.ok) {
      return Errors.make("Failed to update user 'profile' record");
    }

    return { ok: true, profile: newProfile };
  }

  static async delete(
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
      ok: true,
      deletedRecords: [
        ...userRecords,
        groupmeRecord?.value ? groupmeRecord : "<no groupmeId record found>",
      ],
    };
  }
}
