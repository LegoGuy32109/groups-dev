import { signup } from "../utilities/security.ts";

// import { Db } from "../utilities/Database.ts";
// Deno.env.set(
//   "DENO_KV_ACCESS_TOKEN",
//   "ddp_fL7YTOTyIH6ZsFlfgLygYIcz9niRMs4WQtVz",
// );
// await Db.configure({
//   path:
//     "https://api.deno.com/databases/a731301f-58ee-4173-b4b3-93c3c19bd089/connect",
//   // "https://api.deno.com/databases/6cfeb8e7-fb49-4973-bbf3-192f0e6617f5/connect",
// });

async function makeTokenLink(
  firstName: string,
  lastName: string,
  defaultGroup?: string,
) {
  const signupResult = await signup(firstName, lastName, defaultGroup);
  if (signupResult.ok) {
    console.log(
      `Hi ${firstName}! This is Josh the tech admin for E91Students sunday nights. 
I'm sending you this link so you can access our Attendance tracker 2.0
https://e91students.deno.dev/login?token=${signupResult.token}
Every link is personalized, so please don't share them.\n`,
    );
  }
}

await makeTokenLink("Josh", "Hale");
// await makeTokenLink("Lake", "Webb");
// await makeTokenLink("Aaron", "Creech");
// await makeTokenLink("Doug", "Stout", "Senior Boys");
// await makeTokenLink("Rick", "Morse", "Junior Boys");
// await makeTokenLink("Jason", "Gillespie", "Junior Boys");
// await makeTokenLink("Shannon", "Teurman", "Senior Girls");
// await makeTokenLink("Sarah", "Kovell", "Junior Girls");
// await makeTokenLink("Kailey", "Koyles", "Sophomore Girls");
// await makeTokenLink("Betsy", "Creech", "Sophomore Girls");
// await makeTokenLink("Mary", "Keller", "Freshman Girls");
// await makeTokenLink("Jennifer", "Gillespie", "Freshman Girls");
// await makeTokenLink("Matt", "Whittaker", "Sophomore Boys");
// await makeTokenLink("Daniel", "Burson", "Sophomore Boys");
// await makeTokenLink("Zac", "Cino", "Freshman Boys");
// await makeTokenLink("Abby", "Carrow", "JuniorHigh Girls");
// await makeTokenLink("Rebecca", "Stout", "JuniorHigh Girls");
// await makeTokenLink("Darby", "Fehl", "JuniorHigh Girls");
// await makeTokenLink("Zach", "Shetterly", "JuniorHigh Boys");
// await makeTokenLink("Keith", "O'Dell", "JuniorHigh Boys");
// await makeTokenLink("Nate", "Paul", "JuniorHigh Boys");
// await makeTokenLink("Cory", "Teurman");
// await makeTokenLink("Christina", "McConkey");
