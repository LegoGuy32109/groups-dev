import { Handlers, PageProps } from "$fresh/server.ts";
const NAMES = ["Alice", "Bob", "Charlie", "Dave", "Eve", "Frank"];
interface Data {
  results: string[];
  query: string;
}
export const handler: Handlers<Data> = {
  GET(req, ctx) {
    const url = new URL(req.url);
    const query = url.searchParams.get("q") ?? "";
    const results = NAMES.filter((name) =>
      name.toLowerCase().includes(query.toLowerCase())
    );
    return ctx.render({ results, query });
  },
};
export default function Page({ data }: PageProps<Data>) {
  const { results, query } = data;
  return (
    <div>
      <form>
        <input type="text" name="q" value={query} class="border p-1" />
        <button type="submit" class="ml-1 px-2 py-1 bg-gray-100 border">
          Search
        </button>
      </form>
      <ul>
        {results.map((name) => <li key={name}>{name}</li>)}
      </ul>
    </div>
  );
}
