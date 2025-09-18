import { Cookies } from "../../utilities/Cookies.ts";
import { Db } from "../../utilities/Database.ts";
import { define } from "../../utils.ts";

export const handler = define.handlers({
  async GET({ req }) {
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
        // to show errors
        headers.set("location", "/login");
        return new Response(
          null,
          {
            status: 303, // redirect
            headers,
          },
        );
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
});
