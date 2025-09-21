import { Cookies } from "../../utilities/Cookies.ts";
import { Db } from "../../utilities/Database.ts";
import { define, makeRedirectResponse } from "../../utils.ts";

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
        // redirect to login to show errors
        return makeRedirectResponse(headers, "/login");
      }
    }
    Cookies.clear(headers, Cookies.Auth);
    return makeRedirectResponse(headers, "/login");
  },
});
