import { Db } from "../utilities/Database.ts";
// await Db.configure({
//   path:
//     // PROD: "https://api.deno.com/databases/ae76c420-bdfd-4d09-8a5d-502e21f7944b/connect",
//     "https://api.deno.com/databases/35ef7446-4621-442b-bb46-27360a95ab6a/connect",
// });
const kv = await Db.kv();

const all = kv.list({ prefix: [] });
let rows = 0;
for await (const thing of all) {
  console.log(thing);
  rows++;
}
console.log(`${rows} rows returned`);
