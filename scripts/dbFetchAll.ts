// deno-lint-ignore-file no-unused-vars
// malleable script changed by dev as necessary
import { Db } from "../utilities/Database.ts";

const prodKvPath =
  "https://api.deno.com/databases/ae76c420-bdfd-4d09-8a5d-502e21f7944b/connect";
const devKvPath =
  "https://api.deno.com/databases/6cfeb8e7-fb49-4973-bbf3-192f0e6617f5/connect";

const kv = await Db.kv(devKvPath);

const all = kv.list({ prefix: ["users"] });
let rows = 0;
for await (const thing of all) {
  console.log(thing);
  rows++;
}
console.log(`${rows} rows returned`);
