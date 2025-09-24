const dbToDeletePath = "https://api.deno.com/databases/35ef7446-4621-442b-bb46-27360a95ab6a/connect"
const devKv = await Deno.openKv(dbToDeletePath);
const iter = devKv.list({ prefix: [] });
const deletes: Promise<void>[] = [];

for await (const entry of iter) {
   console.log('Deleting: ', entry.key)
   deletes.push(devKv.delete(entry.key));
}

await Promise.all(deletes);
console.log(`Finished Deleting ${deletes.length} items`)
