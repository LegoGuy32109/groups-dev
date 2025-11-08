import { Buffer } from "node:buffer";
import { Sessions } from "../../../data/Sessions.ts";
import { Cookies } from "../../../utilities/Cookies.ts";
import { define, makeJsonResponse } from "../../../utils.ts";
import crypto from "node:crypto";
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
    const { profile } = userResult;

    const challenge = crypto.randomBytes(32).toString("base64url");
    const publicKeyOptions = {
      challenge,
      rp: {
        name: "Groups",
        id: ctx.url.hostname,
      },
      user: {
        id: Buffer.from(userId, "utf8").toString("base64url"),
        name: `${profile.firstName} ${profile.lastName}`,
        displayName: `${profile.firstName}`,
      },
      pubKeyCredParams: [
        { type: "public-key", alg: -7 }, // ES256
        { type: "public-key", alg: -257 }, // RS256 (optional)
      ],
      authenticatorSelection: {
        // authenticatorAttachment: "platform", // built-in biometric
        userVerification: "preferred", // require biometric verification
        residentKey: "preferred",
      },
      timeout: 60000,
      attestation: "none", // or "direct" / "indirect"
      excludeCredentials: [], // list existing credentials IDs to prevent duplicates
    };
    return makeJsonResponse({ publicKey: publicKeyOptions }, 200);
  },
});
