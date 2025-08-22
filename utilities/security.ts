import { Db } from "./Database.ts";
import { Dates } from "./dates.ts";

export interface Profile {
  username: string;
  displayName: string;
  createdOn: string; // iso
  updatedOn: string; // iso
}

export interface Authentication {
  algo: string;
  iterations: number;
  saltB64: string;
  hashB64: string;
  createdOn: string; // iso
}

export type AsyncResult<T> = Promise<Result<T>>;
export type Result<T> =
  | { success: true } & T
  | {
    success: false;
    errors: Array<string>;
  };

const HASHING_ITERATIONS = 100_000;

export function toBase64(u8: Uint8Array): string {
  return btoa(String.fromCharCode(...u8));
}

export function fromBase64(b64: string): Uint8Array {
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
  salt: Uint8Array,
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
): AsyncResult<{ userId: string }> {
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
  };

  const userProfileRecord: Profile = {
    username,
    displayName: username,
    createdOn: nowIso,
    updatedOn: nowIso,
  };

  const userAuthKey = ["users", newUserId, "auth"];
  const userProfileKey = ["users", newUserId, "profile"];

  const createUserResponse = await kv.atomic()
    // ensure the user does not exist
    .check({ key: userAuthKey, versionstamp: null })
    // ensure username isn't taken
    .check({ key: usernameKey, versionstamp: null })
    .set(userAuthKey, userAuthRecord)
    .set(userProfileKey, userProfileRecord)
    // provide lookup for username -> userId
    .set(usernameKey, newUserId)
    .commit();

  if (!createUserResponse.ok) {
    return {
      success: false,
      errors: ["User was created concurrently. Try again."],
    };
  }

  return { success: true, userId: newUserId };
}
