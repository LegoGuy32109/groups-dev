import { Sessions } from "../../../data/Sessions.ts";
import { Cookies } from "../../../utilities/Cookies.ts";
import { define, makeJsonResponse } from "../../../utils.ts";
import { Users } from "../../../data/Users.ts";

export const handler = define.handlers({
  async POST(ctx) {
    const headers = new Headers(ctx.req.headers);
    const sessionId = Cookies.get(headers, Cookies.Auth);
    const noSessionResponse = makeJsonResponse({
      errors: ["Failed to retrieve current session."],
    }, 400);
    if (!sessionId) return noSessionResponse;
    const sessionResult = await Sessions.getSession(sessionId);
    if (!sessionResult.ok) return noSessionResponse;
    const { session: { userId } } = sessionResult;
    const userResult = await Users.getUserProfile(userId);
    if (!userResult.ok) {
      return makeJsonResponse({ errors: userResult.errors }, 400);
    }

    const request = await ctx.req.json();
    // const publicKey = globalThis.PublicKeyCredential
    //   .parseCreationOptionsFromJSON(
    //     request.publicKey,
    //   );
    console.log(request);

    return makeJsonResponse({ publicKey: "" }, 200);
  },
});
