import { define, makeErrorResponse } from "../../../utils.ts";
import { Db } from "../../../utilities/Database.ts";
import { Sessions } from "../../../data/Sessions.ts";
import { UserAgent } from "@std/http/user-agent";
import { Cookies } from "../../../utilities/Cookies.ts";

export const handler = define.handlers({
  async POST({ req }) {
    let requestBody: { accessCode?: string } | undefined;
    try {
      requestBody = await req.json();
    } catch {
      return makeErrorResponse("Invalid request body.");
    }

    const accessCode = String(requestBody?.accessCode ?? "").trim();
    if (!accessCode) {
      return makeErrorResponse("Missing access code.");
    }

    const tokenResult = await Db.consumeToken(accessCode);
    if (!tokenResult.ok) {
      return makeErrorResponse(tokenResult.errors);
    }

    const { userId } = tokenResult;
    const sessionResult = await Sessions.login(userId, {
      userAgent: new UserAgent(req.headers.get("user-agent")),
    });
    if (!sessionResult.ok) {
      return makeErrorResponse(sessionResult.errors);
    }

    const headers = Cookies.set({
      headers: new Headers(req.headers),
      cookie: {
        name: Cookies.Auth,
        value: sessionResult.sessionId,
        maxAge: 14 * 24 * 3600,
      },
    });

    headers.set("Content-Type", "application/json");
    return new Response(JSON.stringify({ ok: true, redirect: "/" }), {
      status: 200,
      headers,
    });
  },
});
