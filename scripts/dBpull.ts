Deno.env.set(
  "DENO_KV_ACCESS_TOKEN",
  "ddp_fL7YTOTyIH6ZsFlfgLygYIcz9niRMs4WQtVz",
);
import { Db } from "../utilities/Database.ts";
await Deno.openKv();
await Db.configure({
  path:
    // fresh dev"https://api.deno.com/databases/a731301f-58ee-4173-b4b3-93c3c19bd089/connect",
    "https://api.deno.com/databases/35ef7446-4621-442b-bb46-27360a95ab6a/connect",
});
const kv = await Db.kv();

const all = kv.list({ prefix: [] });
let rows = 0;
for await (const thing of all) {
  console.log(thing);
  rows++;
}
console.log(`${rows} rows returned`);
