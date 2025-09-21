import { GroupmeIntegration } from "../../../types/entities/Groupme.ts";
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

    Cookies.clear(headers, Cookies.Auth);
    const groupmeIntegration: GroupmeIntegration = {
      id: responseData.id,
      accessToken: access_token,
      info: responseData,
    };
    Cookies.set({
      headers,
      cookie: {
        name: Cookies.Groupme,
        value: JSON.stringify(groupmeIntegration),
      },
    });
    return makeRedirectResponse(headers);
  },
});
