import { Cookies } from "../../../utilities/Cookies.ts";
import { define, makeRedirectResponse } from "../../../utils.ts";

export const handler = define.handlers({
  async GET(ctx) {
    const headers = ctx.req.headers;

    const access_token = ctx.url.searchParams.get("access_token");
    if (!access_token) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: {
          "Content-Type": "application/json",
        },
      });
    }

    // check token exists for user
    const response = await fetch(
      `https://api.groupme.com/v3/users/me?token=${access_token}`,
    );
    const responseData = await response.json();
    // if failed to get information redirect to login page with error
    if (!response.ok) {
      Cookies.set({
        headers,
        cookie: {
          name: Cookies.Error,
          value: JSON.stringify(`groupme error: ${responseData}`),
        },
      });
      return makeRedirectResponse(headers, "/login");
    }

    // check if there is a

    // groupme login valid, save token to cookie and redirect to home
    // middleware will determine a Auth cookie isn't present but token is
    // and apply login logic to set a
    Cookies.clear(headers, Cookies.Auth);
    Cookies.set({
      headers,
      cookie: {
        name: Cookies.Groupme,
        value: access_token,
      },
    });
    return makeRedirectResponse(headers);
  },
});
