import { Db } from "../utilities/Database.ts";
//await Db.configure({ test: true });
const kv = await Db.kv();
const all = kv.list({ prefix: [] });
let rows = 0;
for await (const thing of all) {
  console.log(thing);
  rows++;
}
console.log(`${rows} rows returned`);
