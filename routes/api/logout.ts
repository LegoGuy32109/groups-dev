import { Handlers } from "$fresh/server.ts";
import { Cookies } from "../../utilities/Cookies.ts";
import { Db } from "../../utilities/Database.ts";

export const handler: Handlers = {
  async GET(req) {
    const headers = new Headers(req.headers);
    const sessionId = Cookies.get(headers, Cookies.Auth);
    if (sessionId) {
      const removeResult = await Db.removeSession(sessionId);
      if (!removeResult.success) {
        Cookies.set({
          headers,
          cookie: {
            name: Cookies.Error,
            value: JSON.stringify(removeResult.errors),
          },
        });
      }
    }
    Cookies.clear(headers, Cookies.Auth);
    headers.set("location", "/");
    return new Response(
      null,
      {
        status: 303, // redirect
        headers,
      },
    );
  },
};
