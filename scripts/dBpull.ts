Deno.env.set(
  "DENO_KV_ACCESS_TOKEN",
  "ddp_fL7YTOTyIH6ZsFlfgLygYIcz9niRMs4WQtVz",
);
import { Db } from "../utilities/Database.ts";
await Deno.openKv();
await Db.configure({
  path:
    "https://api.deno.com/databases/ae76c420-bdfd-4d09-8a5d-502e21f7944b/connect",
  // "https://api.deno.com/databases/6cfeb8e7-fb49-4973-bbf3-192f0e6617f5/connect",
});
const kv = await Db.kv();

const all = kv.list({ prefix: [] });
let rows = 0;
for await (const thing of all) {
  console.log(thing);
  rows++;
}
console.log(`${rows} rows returned`);
const result = await kv.get(["tokens", "ca226f2a-a543-403a-8a3d-4a8a14578440"]);
console.log(result);
