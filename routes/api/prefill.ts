import { Handlers } from "$fresh/server.ts";
import { Db } from "../../utilities/Database.ts";
/**
 * Send a token to this endpoint to retrieve a new user's
 * username and password to prefill in login form, to
 * be captured by password manager.
 */
export const handler: Handlers = {
  async POST(req, _ctx) {
    const { token } = await req.json() ?? {};
    if (!token) {
      return new Response("Missing token", { status: 400 });
    }
    const kv = await Db.kv();
    const { value } = await kv.get<
      { username: string; password: string }
    >(["tokens", token]);
    if (!value) {
      return new Response("Invalid or expired token", { status: 401 });
    }
    return new Response(JSON.stringify(value), {
      headers: { "Content-Type": "application/json" },
    });
  },
};
