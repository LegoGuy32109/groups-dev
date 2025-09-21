import { signup } from "../utilities/security.ts";
import { Db } from "../utilities/Database.ts";

Deno.env.set(
  "DENO_KV_ACCESS_TOKEN",
  "ddp_fL7YTOTyIH6ZsFlfgLygYIcz9niRMs4WQtVz",
);
await Db.configure({
  path:
    "https://api.deno.com/databases/ae76c420-bdfd-4d09-8a5d-502e21f7944b/connect",
  // "https://api.deno.com/databases/6cfeb8e7-fb49-4973-bbf3-192f0e6617f5/connect",
});

async function makeTokenLink(
  firstName: string,
  lastName: string,
  defaultGroup?: string,
) {
  const signupResult = await signup(firstName, lastName, defaultGroup);
  if (signupResult.success) {
    console.log(
      `https://e91students.deno.dev/login?token=${signupResult.token}`,
    );
  }
}

makeTokenLink("Josh", "Hale", "Senior Boys");
