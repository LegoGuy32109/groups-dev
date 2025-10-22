import { Session } from "../types/entities/Session.ts";
import { Db } from "../utilities/Database.ts";
import { AsyncResult, Errors } from "../utilities/Errors.ts";

export class Sessions {
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

    return { ok: true };
  }

  static async getSession(
    sessionId: string,
  ): AsyncResult<{ session: Session }> {
    const kv = await Db.kv();

    const { value: session } = await kv.get<Session>(["sessions", sessionId]);
    if (!session) {
      return Errors.make(`No session found with id '${sessionId}'`);
    }

    return { ok: true, session };
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

    return { ok: true, sessionIds };
  }

  static async getUserSessions(
    userId: string,
  ): AsyncResult<{ sessions: Array<Session> }> {
    const kv = await Db.kv();

    const sessionIdsResult = await Sessions.getUserSessionIds(userId);
    if (!sessionIdsResult.ok) return sessionIdsResult;
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

    return { ok: true, sessions };
  }

  static async removeSession(
    sessionId: string,
  ): AsyncResult<{ deletedSession: Session; userSessionIds: Array<string> }> {
    const kv = await Db.kv();

    // find user id in session record
    const sessionResult = await Sessions.getSession(sessionId);
    if (!sessionResult.ok) return sessionResult;
    const { session } = sessionResult;
    const { userId } = session;

    // get current sessions for user
    const sessionIdsResult = await Sessions.getUserSessionIds(userId);
    if (!sessionIdsResult.ok) return sessionIdsResult;
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
      ok: true,
      deletedSession: session,
      userSessionIds: updatedSessionIds,
    };
  }
}
