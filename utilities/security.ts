import { UserAgent } from "@std/http";
import { Authentication } from "../types/entities/Authentication.ts";
import { Profile } from "../types/entities/Profile.ts";
import { Session } from "../types/entities/Session.ts";
import { Db } from "./Database.ts";
import { Dates } from "./Dates.ts";

export type AsyncResult<T = void> = Promise<Result<T>>;
export type Result<T = void> = T extends void
  ? { success: true } | { success: false; errors: Array<string> }
  : T & { success: true } | { success: false; errors: Array<string> };

const HASHING_ITERATIONS = 100_000;

export function toBase64(u8: Uint8Array): string {
  return btoa(String.fromCharCode(...u8));
}

export function fromBase64(b64: string): Uint8Array<ArrayBuffer> {
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) {
    out[i] = bin.charCodeAt(i);
  }
  return out;
}

export function timingSafeEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

export async function getPbkdf2Hash(
  password: string,
  salt: Uint8Array<ArrayBuffer>,
  iterations = HASHING_ITERATIONS,
): Promise<Uint8Array> {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    enc.encode(password),
    { name: "PBKDF2" },
    false,
    ["deriveBits"],
  );

  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt,
      iterations,
      hash: "SHA-256",
    },
    keyMaterial,
    256,
  );

  return new Uint8Array(derivedBits);
}

export async function signup(
  username: string,
  password: string,
): AsyncResult<{ userId: string; token: string }> {
  const kv = await Db.kv();

  const usernameKey = ["usernames", username];
  const { value: existingId } = await kv.get(usernameKey);
  if (existingId) {
    return { success: false, errors: ["User already exists."] };
  }

  const newUserId = crypto.randomUUID();

  // generate 16 bits of salt
  const salt = crypto.getRandomValues(new Uint8Array(16));

  const derivedKey = await getPbkdf2Hash(password, salt);

  const nowIso = Dates.getNowIso();

  const userAuthRecord: Authentication = {
    algo: "PBKDF2-SHA256",
    iterations: HASHING_ITERATIONS,
    saltB64: toBase64(salt),
    hashB64: toBase64(derivedKey),
    createdOn: nowIso,
    createdBy: "",
    updatedOn: "",
    updatedBy: "",
  };

  const userProfileRecord: Profile = {
    username,
    createdOn: nowIso,
    updatedOn: nowIso,
    createdBy: "system",
    updatedBy: "system",
  };

  const userAuthKey = ["users", newUserId, "auth"];
  const userProfileKey = ["users", newUserId, "profile"];

  const prefillToken = crypto.randomUUID();
  const prefillKey = ["tokens", prefillToken];
  // In 28 days this token record will expire
  const expireIn = 28 * 24 * 60 * 60 * 1000;

  const createUserResponse = await kv.atomic()
    // ensure the user does not exist
    .check({ key: userAuthKey, versionstamp: null })
    // ensure username isn't taken
    .check({ key: usernameKey, versionstamp: null })
    .set(userAuthKey, userAuthRecord)
    .set(userProfileKey, userProfileRecord)
    // provide lookup for username -> userId
    .set(usernameKey, newUserId)
    // create temporary token for login prefill link
    .check({ key: prefillKey, versionstamp: null })
    .set(prefillKey, { username, password }, { expireIn })
    .commit();

  if (!createUserResponse.ok) {
    return {
      success: false,
      errors: ["User was created concurrently. Try again."],
    };
  }

  return { success: true, userId: newUserId, token: prefillToken };
}

export async function login(
  username: string,
  password: string,
  userAgent?: UserAgent,
): AsyncResult<{ sessionId: string }> {
  // find user id from username
  const userIdResult = await Db.getUserId(username);
  if (!userIdResult.success) {
    return userIdResult;
  }
  const { userId } = userIdResult;
  // find auth from user id
  const userResult = await Db.getUser(userId);
  if (!userResult.success) {
    return userResult;
  }
  const { authentication } = userResult;
  // hash password with salt from auth record
  const { saltB64, hashB64 } = authentication;
  const correctPasswordHash = fromBase64(hashB64);
  const givenPasswordHash = await getPbkdf2Hash(password, fromBase64(saltB64));
  // compare given password hash with hash in auth record
  const isCorrectPassword = timingSafeEqual(
    correctPasswordHash,
    givenPasswordHash,
  );
  if (!isCorrectPassword) {
    return {
      success: false,
      errors: [`incorrect password for user '${username}'`],
    };
  }
  // if hashes match create a new session, it's id will be the auth cookie
  const newSessionId = crypto.randomUUID();
  const nowIso = Dates.getNowIso();
  const newSessionRecord: Session = {
    userId,
    createdOn: nowIso,
    updatedOn: nowIso,
    createdBy: "system",
    updatedBy: "system",
    userAgent,
  };
  const addSessionResult = await Db.addNewSession(
    newSessionId,
    newSessionRecord,
  );
  if (!addSessionResult.success) {
    return addSessionResult;
  }
  // return cookie for response in other function
  return { success: true, sessionId: newSessionId };
}
export async function logout(
  sessionId: string,
): AsyncResult<{ deletedSession: Session; userSessionIds: Array<string> }> {
  return await Db.removeSession(sessionId);
}
