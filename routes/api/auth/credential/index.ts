import { Sessions } from "../../../../data/Sessions.ts";
import { Users } from "../../../../data/Users.ts";
import { Cookies } from "../../../../utilities/Cookies.ts";
import {
  define,
  makeErrorResponse,
  makeJsonResponse,
} from "../../../../utils.ts";

export const handler = define.handlers({
  async POST(ctx) {
    const headers = new Headers(ctx.req.headers);
    const sessionId = Cookies.get(headers, Cookies.Auth);
    const noSessionResponse = makeErrorResponse(
      "Failed to retrieve current session.",
      401,
    );
    if (!sessionId) return noSessionResponse;
    const sessionResult = await Sessions.getSession(sessionId);
    if (!sessionResult.ok) return noSessionResponse;
    const { session: { userId } } = sessionResult;
    const userResult = await Users.getProfile(userId);
    if (!userResult.ok) {
      return makeErrorResponse(userResult.errors);
    }

    const request = await ctx.req.json();
    const { credential } = request;
    if (!credential?.id || !credential.response?.publicKey) {
      return makeErrorResponse("Failed to parse given credential.");
    }

    const setCredentialResult = await Users.setCredential(
      userId,
      credential,
    );
    if (!setCredentialResult.ok) {
      return makeErrorResponse(setCredentialResult.errors);
    }

    console.log("successfully saved credential!");
    return makeJsonResponse({ ok: true }, 200);
  },
});
