// deno-lint-ignore-file no-unused-vars
// malleable script changed by dev as necessary
import { Profile } from "../types/entities/Profile.ts";

const prodKvPath =
  "https://api.deno.com/databases/ae76c420-bdfd-4d09-8a5d-502e21f7944b/connect";
const devKvPath =
  "https://api.deno.com/databases/6cfeb8e7-fb49-4973-bbf3-192f0e6617f5/connect";

// INFO: change these 👇🏻
const kv = await Deno.openKv();
const userId = "";

if (!userId) {
  console.error("Set userId in scripts/generateLoginCode.ts");
  Deno.exit(1);
}

const { value: profile } = await kv.get<Profile>([
  "users",
  userId,
  "profile",
]);
if (!profile) {
  console.error(`No profile found for userId '${userId}'`);
  Deno.exit(1);
}

const expireIn = 24 * 60 * 60 * 1000;
const expiresOn = new Date(Date.now() + expireIn).toISOString();

function hasMinimumPairs(code: string, minimumPairs: number): boolean {
  const counts: Record<string, number> = {};
  for (const digit of code) {
    counts[digit] = (counts[digit] ?? 0) + 1;
  }
  const pairs = Object.values(counts).filter((count) => count >= 2).length;
  return pairs >= minimumPairs;
}

function generateAccessCode(): string {
  while (true) {
    const digits = crypto.getRandomValues(new Uint8Array(6));
    const code = Array.from(digits, (byte, index) => {
      const digit = byte % 10;
      return index === 0 && digit === 0 ? 1 : digit;
    }).join("");
    if (hasMinimumPairs(code, 2)) {
      return code;
    }
  }
}

let token = "";
while (!token) {
  const candidate = generateAccessCode();
  const tokenKey = ["tokens", candidate];
  const createTokenResponse = await kv.atomic()
    .check({ key: tokenKey, versionstamp: null })
    .set(tokenKey, { userId, expiresOn }, { expireIn })
    .commit();
  if (createTokenResponse.ok) {
    token = candidate;
  }
}

console.log(`${profile.firstName} ${profile.lastName}`);
console.log(`Access code: ${token}`);
console.log(`Expires: ${expiresOn}`);
