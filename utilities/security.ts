import { Dates } from "./dates.ts";

const HASHING_ITERATIONS = 100_000;

function toBase64(u8: Uint8Array): string {
  return btoa(String.fromCharCode(...u8));
}

function fromBase64(b64: string): Uint8Array {
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) {
    out[i] = bin.charCodeAt(i);
  }
  return out;
}

function timingSafeEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

async function getPbkdf2Hash(
  password: string,
  salt: Uint8Array,
  iterations: number,
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

export async function signup(username: string, password: string) {
  const kv = await Deno.openKv();

  const usernameKey = ["usernames", username];
  const { value: existingId } = await kv.get(usernameKey);
  if (existingId) {
    return { success: false, errors: ["User already exists."] };
  }

  const newUserId = crypto.randomUUID();

  // generate 16 bits of salt
  const salt = crypto.getRandomValues(new Uint8Array(16));

  const derivedKey = await getPbkdf2Hash(password, salt, HASHING_ITERATIONS);

  const nowIso = Dates.getNowIso();

  const userAuthRecord = {
    algo: "PBKDF2-SHA256",
    iterations: HASHING_ITERATIONS,
    saltB64: toBase64(salt),
    hashB64: toBase64(derivedKey),
    createdAt: nowIso,
  };

  const userProfileRecord = {
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
}
