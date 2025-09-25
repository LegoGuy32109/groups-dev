import { Attendance } from "../types/entities/Attendance.ts";
import { Profile } from "../types/entities/Profile.ts";
import { Session } from "../types/entities/Session.ts";
import { GroupmeIntegration } from "../types/Groupme.ts";
import { Dates } from "./Dates.ts";
import { Errors } from "./Errors.ts";
import { AsyncResult } from "./security.ts";

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

  /**
   * Get a kv instance from Db singleton
   * Might have configuration already applied
   *
   * Note: see `Db.configure()`
   */
  static async kv(): Promise<Deno.Kv> {
    if (Db._kv) {
      return Db._kv;
    }
    // if it wasn't already configured, give default
    return await Deno.openKv();
  }

  static async getUsers() {
    const kv = await Db.kv();

    return await Array.fromAsync(kv.list({ prefix: ["users"] }));
  }

  static async getGroupmeIds() {
    const kv = await Db.kv();

    return await Array.fromAsync(
      kv.list<string>({ prefix: ["groupmeIds"] }),
    );
  }

  static async getUserIdFromGroupmeId(
    id: string,
  ): AsyncResult<{ userId: string }> {
    const kv = await Db.kv();

    const userId = (await kv.get<string>(["groupmeIds", id])).value;
    if (!userId) {
      return Errors.make(`No userId found for groupme id '${id}'`);
    }

    return { success: true, userId };
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

  /**
   * Add user login session to the database
   * 1) [users, userId, sessions] => array of sessionIds
   * 2) [sessions, sessionId] => Session
   */
  static async addNewSession(sessionId: string, session: Session): AsyncResult {
    const kv = await Db.kv();

    const { userId } = session;
    const userSessionsKey = ["users", userId, "sessions"];
    const userSessions = (await kv.get<Array<string>>(userSessionsKey)).value ??
      [];

    // modify sessions appending to existing sessions
    userSessions.push(sessionId);
    const addSessionResult = await kv.atomic()
      .set(userSessionsKey, userSessions)
      .set(["sessions", sessionId], session)
      .commit();
    if (!addSessionResult.ok) {
      return Errors.make(
        `Failed to add session to database, ${sessionId}: ${session}`,
      );
    }

    return { success: true };
  }

  static async getSession(
    sessionId: string,
  ): AsyncResult<{ session: Session }> {
    const kv = await Db.kv();

    const { value: session } = await kv.get<Session>(["sessions", sessionId]);
    if (!session) {
      return Errors.make(`No session found with id '${sessionId}'`);
    }

    return { success: true, session };
  }

  static async getUserSessionIds(
    userId: string,
  ): AsyncResult<{ sessionIds: Array<string> }> {
    const kv = await Db.kv();

    const { value: sessionIds } = await kv.get<Array<string>>([
      "users",
      userId,
      "sessions",
    ]);
    if (!sessionIds) {
      return Errors.make(`Failed to find sessions for userId: '${userId}'`);
    }

    return { success: true, sessionIds };
  }

  static async getUserSessions(
    userId: string,
  ): AsyncResult<{ sessions: Array<Session> }> {
    const kv = await Db.kv();

    const sessionIdsResult = await Db.getUserSessionIds(userId);
    if (!sessionIdsResult.success) return sessionIdsResult;
    const { sessionIds } = sessionIdsResult;

    const sessionEntries = await kv.getMany<Array<Session>>(
      sessionIds.map((id) => ["sessions", id]),
    );
    const { sessions, invalidSessions } = sessionEntries.reduce(
      (acc, sessionEntry) => {
        if (sessionEntry.value) {
          acc.sessions.push(sessionEntry.value);
        } else {
          acc.invalidSessions.push(sessionEntry.key);
        }
        return acc;
      },
      {
        sessions: new Array<Session>(),
        invalidSessions: new Array<Deno.KvKey>(),
      },
    );

    // if there were, indicate there are invalid sessions,
    // but that doesn't stop us from returning valid ones
    if (invalidSessions.length > 0) {
      console.error(
        `Invalid sessions in database for user '${userId}'\n${invalidSessions}`,
      );
    }

    return { success: true, sessions };
  }

  static async removeSession(
    sessionId: string,
  ): AsyncResult<{ deletedSession: Session; userSessionIds: Array<string> }> {
    const kv = await Db.kv();

    // find user id in session record
    const sessionResult = await Db.getSession(sessionId);
    if (!sessionResult.success) return sessionResult;
    const { session } = sessionResult;
    const { userId } = session;

    // get current sessions for user
    const sessionIdsResult = await Db.getUserSessionIds(userId);
    if (!sessionIdsResult.success) return sessionIdsResult;
    const { sessionIds } = sessionIdsResult;

    // remove given session id
    const updatedSessionIds = sessionIds.filter((id) => id !== sessionId);
    const removeSessionResult = await kv.atomic()
      .set(["users", userId, "sessions"], updatedSessionIds)
      .delete(["sessions", sessionId])
      .commit();
    if (!removeSessionResult.ok) {
      return Errors.make(
        `Failed to delete session '${sessionId}' and update user '${userId}' active sessions.`,
      );
    }

    return {
      success: true,
      deletedSession: session,
      userSessionIds: updatedSessionIds,
    };
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
      this.deleteAllDataInTable("sessions"),
      this.deleteAllDataInTable("tokens"),
      this.deleteAllDataInTable("attendance"),
    ]);
  }

  static async updateAttendance(
    group: string,
    delta: number,
    causedBy?: string, // guid
  ): AsyncResult {
    const kv = await Db.kv();
    const today = Dates.getMonthDay();
    const now = Dates.getNowIso();

    const key = ["attendance", group, today];
    const existsValue = await kv.get<Attendance>(key);

    // first counter
    if (!existsValue.value) {
      if (delta > 0) {
        const result = await kv.atomic()
          .check({ key, versionstamp: null })
          .set(
            key,
            {
              count: delta,
              createdOn: now,
              updatedOn: now,
              createdBy: causedBy ?? "system",
              updatedBy: causedBy ?? "system",
            } satisfies Attendance,
          ).commit();
        if (!result.ok) {
          return Errors.make("Failed to create new value");
        }
      }
      return { success: true };
    }
    // counter already exists
    const other = await kv.atomic()
      .set(
        key,
        {
          ...existsValue.value,
          count: Math.max(0, existsValue.value.count + delta),
          updatedOn: now,
          updatedBy: causedBy ?? "system",
        } satisfies Attendance,
      ).commit();
    if (!other.ok) {
      return Errors.make("Failed to create new value");
    }
    return { success: true };
  }
}
