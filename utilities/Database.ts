import { Authentication } from "../types/entities/Authentication.ts";
import { Profile } from "../types/entities/Profile.ts";
import { Session } from "../types/entities/Session.ts";
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
      return Errors.make(`No userId found for ${username}`);
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
    // delete username in username lookup table
    const username = profile.username;
    const usernameKey = ["usernames", username];
    // get username record to indicate what was deleted
    const usernameRecord = await kv.get(usernameKey);
    // if no username record existed, don't halt execution but note it should have been there
    if (!usernameRecord.value) {
      console.error(`failed to find username row for ${usernameKey}`);
    }
    const deleteResponse = await deleteTransaction
      .delete(usernameKey)
      .commit();
    if (!deleteResponse.ok) {
      return Errors.make(
        `Failed to delete both username '${username}' and userId '${userId}' from database.`,
      );
    }
    return {
      success: true,
      deletedRecords: [...userRecords, usernameRecord],
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
    ]);
  }
}
