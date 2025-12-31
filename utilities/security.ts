import { UserAgent } from "@std/http";
import { Profile } from "../types/entities/Profile.ts";
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
  const nowIso = Dates.getNowIso();

  const userProfileRecord: Profile = {
    firstName,
    lastName,
    defaultGroup,
    createdOn: nowIso,
    updatedOn: nowIso,
    createdBy: "system",
    updatedBy: "system",
  };

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
