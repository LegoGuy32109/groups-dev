import { signup } from "../utilities/security.ts";
// import { Db } from "../utilities/Database.ts";

// Deno.env.set(
//   "DENO_KV_ACCESS_TOKEN",
//   "ddp_fL7YTOTyIH6ZsFlfgLygYIcz9niRMs4WQtVz",
// );
// await Db.configure({
//   path:
//     // "https://api.deno.com/databases/ae76c420-bdfd-4d09-8a5d-502e21f7944b/connect",
//     "https://api.deno.com/databases/35ef7446-4621-442b-bb46-27360a95ab6a/connect",
// });

async function makeTokenLink(
  firstName: string,
  lastName: string,
  defaultGroup?: string,
) {
  const signupResult = await signup(firstName, lastName, defaultGroup);
  if (signupResult.success) {
    console.log(
      `http://localhost:5173/login?token=${signupResult.token}`,
    );
  }
}

makeTokenLink("Josh", "Hale", "Senior Boys");
