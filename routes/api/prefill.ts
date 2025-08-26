import { Handlers } from "$fresh/server.ts";
/**
 * Send a token to this endpoint to retrieve a new user's
 * username and password to prefill in login form, to
 * be captured by password manager.
 */
export const handler: Handlers = {
  async POST(req, _ctx) {
    const { token } = await req.json() ?? {};
    console.log(token);
    if (!token) {
      return new Response(null);
    }
    return new Response(null);
  },
};
