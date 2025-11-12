import { encodeBase64Url } from "jsr:@std/encoding@1.0.10/base64url";
import { Sessions } from "../../../../data/Sessions.ts";
import { Users } from "../../../../data/Users.ts";
import { Cookies } from "../../../../utilities/Cookies.ts";
import {
  define,
  makeErrorResponse,
  makeJsonResponse,
  makeRedirectResponse,
} from "../../../../utils.ts";
import { UserAgent } from "@std/http";

export const handler = define.handlers({
  async GET(ctx) {
    // Use auth cookie to determine user requesting credential
    const headers = new Headers(ctx.req.headers);
    const sessionId = Cookies.get(headers, Cookies.Auth);

    // if no sessionId, then just give a generic challenge
    if (!sessionId) {
      const requestCredentialOptionsJson:
        PublicKeyCredentialRequestOptionsJSON = {
          challenge: encodeBase64Url(
            crypto.getRandomValues(new Uint8Array(32)),
          ),
          rpId: ctx.url.hostname,
          userVerification: "preferred",
          timeout: 60000,
        };

      return makeJsonResponse({ ok: true, requestCredentialOptionsJson }, 200);
    }

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
    const { profile } = userResult;

    // user is valid generate a challenge
    const name = `${profile.firstName} ${profile.lastName}`;
    const createCredentialOptionsJson: PublicKeyCredentialCreationOptionsJSON =
      {
        challenge: encodeBase64Url(crypto.getRandomValues(new Uint8Array(32))),
        rp: {
          name: "Groups",
          id: ctx.url.hostname,
        },
        user: {
          id: userId,
          name,
          displayName: name,
        },
        pubKeyCredParams: [
          { type: "public-key", alg: -7 }, // ES256
          { type: "public-key", alg: -257 }, // RS256 (optional)
        ],
        authenticatorSelection: {
          residentKey: "required", // you must make a passkey in this interaction
          userVerification: "preferred", // don't require biometric verification, PIN is fine
        },
        timeout: 60000, // this offer expires in 1 minute
        attestation: "none", // I want it to be easy as possible to make a passkey, anonymize the device data
        excludeCredentials: [], // list existing credentials IDs to prevent duplicates
      };

    return makeJsonResponse(
      { ok: true, createCredentialOptionsJson },
      200,
    );
  },
  async POST(ctx) {
    // Use auth cookie to determine user requesting credential
    const headers = new Headers(ctx.req.headers);
    const sessionId = Cookies.get(headers, Cookies.Auth);

    // if no sessionId, they're logging in so parse assertion
    if (!sessionId) {
      const request = await ctx.req.json();
      console.log(request);
      const { assertion } = request ?? {};
      console.log("assertion", assertion);
      if (!assertion?.id) {
        return makeErrorResponse("Failed to parse assertion");
      }

      const getCredentialResult = await Users.getCredential(assertion.id);
      console.log("getCredentialResult", getCredentialResult);
      if (!getCredentialResult.ok) {
        return makeErrorResponse(getCredentialResult.errors, 401);
      }

      const { userId } = getCredentialResult;
      const loginResult = await Sessions.login(userId, {
        userAgent: new UserAgent(ctx.req.headers.get("user-agent")),
      });

      if (!loginResult.ok) {
        return makeErrorResponse(loginResult.errors);
      }

      const headers = Cookies.set({
        headers: new Headers(ctx.req.headers),
        cookie: {
          name: Cookies.Auth,
          value: loginResult.sessionId,
          maxAge: 14 * 24 * 3600,
        },
      });
      console.log("done!");
      return makeRedirectResponse(headers, "/");
    }

    const noSessionResponse = makeErrorResponse(
      "Failed to retrieve current session.",
      401,
    );
    if (!sessionId) return noSessionResponse;
    const sessionResult = await Sessions.getSession(sessionId);
    if (!sessionResult.ok) return noSessionResponse;
    const { session: { userId } } = sessionResult;

    const request = await ctx.req.json();
    const { credential } = request ?? {};
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

    return makeJsonResponse({ ok: true }, 201);
  },
});
