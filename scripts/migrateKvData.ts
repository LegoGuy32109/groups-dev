const prodKvPath =
  "https://api.deno.com/databases/ae76c420-bdfd-4d09-8a5d-502e21f7944b/connect";
const devKvPath =
  "https://api.deno.com/databases/6cfeb8e7-fb49-4973-bbf3-192f0e6617f5/connect";

const prodKv = await Deno.openKv(prodKvPath);
const devKv = await Deno.openKv(devKvPath);
const localKv = await Deno.openKv();

const allProd = prodKv.list({ prefix: [] });
let count = 0;
for await (const entry of allProd) {
  console.log(`Upserting ${entry.key} to dev`);
  devKv.set(entry.key, entry.value);
  count++;
}
console.log(`Upserted ${count} entries to real dev`);
