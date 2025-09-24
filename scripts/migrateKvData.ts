const devKvPath = "https://api.deno.com/databases/35ef7446-4621-442b-bb46-27360a95ab6a/connect"
const prodKvPath = "https://api.deno.com/databases/ae76c420-bdfd-4d09-8a5d-502e21f7944b/connect"

const prodKv = await Deno.openKv(prodKvPath)
const devKv = await Deno.openKv(devKvPath)
const localKv = await Deno.openKv()

const allProd = devKv.list({ prefix: [] })
let count = 0;
for await (const entry of allProd) {
   console.log(`Upserting ${entry.key} to dev`)
   localKv.set(entry.key, entry.value)
   count++;
}
console.log(`Upserted ${count} entries to local`)
