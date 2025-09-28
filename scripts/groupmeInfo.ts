import { Profile } from "../types/entities/Profile.ts";

const localKv = await Deno.openKv();
const userEntries = localKv.list<Profile>({ prefix: ["users"] });
const entries = await Array.fromAsync(userEntries);
const profileEntries = entries
  .filter((entry) => entry.key.at(-1) === "profile");

for (const entry of profileEntries) {
  const profile = entry.value;
  if (!profile.groupme) continue;
  console.log(profile.groupme);
  console.log(
    `${profile.firstName} ${profile.lastName} (${profile.groupme.info.name}) | ${profile.groupme.info.email} | ${profile.groupme.info.phone_number} | ${profile.defaultGroup} 
${profile.groupme.accessToken}`,
  );
}
