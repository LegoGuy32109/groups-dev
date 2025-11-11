import { UserAgent } from "@std/http";
import { Profile } from "../types/entities/Profile.ts";
import { Session } from "../types/entities/Session.ts";
import { Db } from "./Database.ts";
import { Dates } from "./Dates.ts";
import { AsyncResult, Errors } from "./Errors.ts";
import { Users } from "../data/Users.ts";
import { Sessions } from "../data/Sessions.ts";

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

// export async function login(
//   username: string,
//   password: string,
//   userAgent?: UserAgent,
// ): AsyncResult<{ sessionId: string }> {
//   // find user id from username
//   const userIdResult = await Db.getUserIdFromUsername(username);
//   if (!userIdResult.ok) {
//     return userIdResult;
//   }
//   const { userId } = userIdResult;
//   // find auth from user id
//   const userResult = await Db.getUserProfile(userId);
//   if (!userResult.ok) {
//     return userResult;
//   }
//   const { authentication } = userResult;
//   // hash password with salt from auth record
//   const { saltB64, hashB64 } = authentication;
//   const correctPasswordHash = fromBase64(hashB64);
//   const givenPasswordHash = await getPbkdf2Hash(password, fromBase64(saltB64));
//   // compare given password hash with hash in auth record
//   const isCorrectPassword = timingSafeEqual(
//     correctPasswordHash,
//     givenPasswordHash,
//   );
//   if (!isCorrectPassword) {
//     return {
//       ok: false,
//       errors: [`incorrect password for user '${username}'`],
//     };
//   }
//   // if hashes match create a new session, it's id will be the auth cookie
//   const newSessionId = crypto.randomUUID();
//   const nowIso = Dates.getNowIso();
//   const newSessionRecord: Session = {
//     userId,
//     createdOn: nowIso,
//     updatedOn: nowIso,
//     createdBy: "system",
//     updatedBy: "system",
//     userAgent,
//   };
//   const addSessionResult = await Db.addNewSession(
//     newSessionId,
//     newSessionRecord,
//   );
//   if (!addSessionResult.ok) {
//     return addSessionResult;
//   }
//   // return cookie for response in other function
//   return { ok: true, sessionId: newSessionId };
// }
//
// export async function logout(
//   sessionId: string,
// ): AsyncResult<{ deletedSession: Session; userSessionIds: Array<string> }> {
//   return await Db.removeSession(sessionId);
// }

export async function createLoginToken(
  userId: string,
): AsyncResult<{ token: string }> {
  const kv = await Db.kv();

  const userResult = await Users.getProfile(userId);
  if (!userResult.ok) {
    return userResult;
  }

  const prefillToken = crypto.randomUUID();
  const prefillKey = ["tokens", prefillToken];
  // In 4 days this token record will expire
  const expireIn = 4 * 24 * 60 * 60 * 1000;
  const expiresOn = new Date(Date.now() + expireIn).toISOString();

  const createTokenResponse = await kv.atomic()
    // create temporary token for login prefill link
    .check({ key: prefillKey, versionstamp: null })
    .set(prefillKey, { userId: userId, expiresOn }, { expireIn })
    .commit();

  if (!createTokenResponse.ok) {
    return Errors.make("Failed to create Token. Try again.");
  }

  return { ok: true, token: prefillToken };
}

export async function signup(
  firstName: string,
  lastName: string,
  defaultGroup?: string,
): AsyncResult<{ userId: string; token: string }> {
  const kv = await Db.kv();

  const newUserId = crypto.randomUUID();

  // generate 16 bits of salt
  // const salt = crypto.getRandomValues(new Uint8Array(16));
  //
  // const derivedKey = await getPbkdf2Hash(password, salt);
  //
  const nowIso = Dates.getNowIso();

  // const userAuthRecord: Authentication = {
  //   algo: "PBKDF2-SHA256",
  //   iterations: HASHING_ITERATIONS,
  //   saltB64: toBase64(salt),
  //   hashB64: toBase64(derivedKey),
  //   createdOn: nowIso,
  //   createdBy: "",
  //   updatedOn: "",
  //   updatedBy: "",
  // };

  const userProfileRecord: Profile = {
    firstName,
    lastName,
    defaultGroup,
    createdOn: nowIso,
    updatedOn: nowIso,
    createdBy: "system",
    updatedBy: "system",
  };

  // const userAuthKey = ["users", newUserId, "auth"];
  const userProfileKey = ["users", newUserId, "profile"];

  const prefillToken = crypto.randomUUID();
  const prefillKey = ["tokens", prefillToken];
  // In 4 days this token record will expire
  const expireIn = 4 * 24 * 60 * 60 * 1000;
  const expiresOn = new Date(Date.now() + expireIn).toISOString();

  const createUserResponse = await kv.atomic()
    // create temporary token for login prefill link
    .check({ key: prefillKey, versionstamp: null })
    .set(prefillKey, { userId: newUserId, expiresOn }, { expireIn })
    .set(userProfileKey, userProfileRecord)
    .commit();

  if (!createUserResponse.ok) {
    return {
      ok: false,
      errors: ["User was created concurrently. Try again."],
    };
  }

  return { ok: true, userId: newUserId, token: prefillToken };
}

interface GroupmeLoginOptions {
  // if a user is logging in for the first time, they should have a userId to connect their groupme account
  // if not, the groupme id should be in the system
  userId?: string;
  userAgent?: UserAgent;
}
export async function groupmeLogin(
  groupmeAccessToken: string,
  options?: GroupmeLoginOptions,
): AsyncResult<{ sessionId: string }> {
  // get groupme id from access token
  const groupmeInfoResponse = await fetch(
    `https://api.groupme.com/v3/users/me?token=${groupmeAccessToken}`,
  );
  const groupmeInfo = (await groupmeInfoResponse.json()).response;
  if (!groupmeInfoResponse.ok) {
    return Errors.make(
      `Failed to get groupme user id: ${groupmeInfoResponse.text()}`,
    );
  }

  let userId = "";
  // if this is the first time logging in, a userId is supplied
  if (options?.userId) {
    userId = options.userId;
    const kv = await Db.kv();
    const groupmeIdSetResult = await kv.set(
      ["groupmeIds", groupmeInfo.id],
      userId,
    );
    if (!groupmeIdSetResult.ok) {
      return Errors.make("Failed to set groupmeId");
    }
  } else {
    // find user id from groupme.id we're assuming this isn't the first time
    const userIdResult = await Db.getUserIdFromGroupmeId(groupmeInfo.id);
    if (!userIdResult.ok) {
      return userIdResult;
    }
    userId = userIdResult.userId;
  }

  // update existing user with groupme integration
  Users.updateProfileGroupme(userId, {
    id: groupmeInfo.id,
    accessToken: groupmeAccessToken,
    info: groupmeInfo,
  });

  // create a new session, it's id will be the auth cookie
  return await Sessions.login(userId, options);
}
