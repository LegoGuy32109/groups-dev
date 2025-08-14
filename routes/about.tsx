import { Handlers } from "$fresh/server.ts";
// must be exported constant named 'handler'
export const handler: Handlers = {
  async GET(req, ctx) {
    // normal path
    if (req.headers.get("accept-encoding")?.includes("br,")) {
      const response = await ctx.render();
      response.headers.set("X-Custom-Header", "<cool data string here>");
      return response;
    }
    // to get here go dev tools > Network > about > wifi with gear > Accepted Content-Encodings > uncheck 'br'
    const uuid = crypto.randomUUID();
    return new Response(uuid, {
      headers: { "Content-Type": "application/json" },
    });
  },
};
export default function AboutPage() {
  return (
    <main>
      <h1>About</h1>
      <p>This is the about page.</p>
    </main>
  );
}
