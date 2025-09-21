import { UserAgent } from "@std/http/user-agent";
import { GroupmeIntegration } from "../../types/entities/Groupme.ts";
import { Cookies } from "../../utilities/Cookies.ts";
import { Db } from "../../utilities/Database.ts";
import { groupmeLogin } from "../../utilities/security.ts";
import { define, makeRedirectResponse, updateErrors } from "../../utils.ts";

export const handler = define.middleware(async (ctx) => {
  const { req, state, url } = ctx;
  // indicate what path the user is on
  state.urlPath = url.pathname;
  console.log(state.urlPath);

  // indicate all state values don't exist yet
  state.session = undefined;
  state.profile = undefined;
  state.errors = undefined;

  // get existing errors into state
  state.errors = Cookies.getErrors(req.headers);

  // if an auth cookie exists with session id, attempt to access it
  const sessionId = Cookies.get(req, Cookies.Auth);
  if (sessionId) {
    const sessionResult = await Db.getSession(sessionId);
    if (sessionResult.success) {
      const profileResult = await Db.getUserProfile(
        sessionResult.session.userId,
      );
      if (profileResult.success) {
        state.session = sessionResult.session;
        state.profile = profileResult.profile;
      } else {
        updateErrors(state, profileResult.errors);
      }
    } else {
      updateErrors(state, sessionResult.errors);
    }
  }

  // if not authenticated, but there's a groupme cookie, try to login that way
  const groupmeIntegrationString = Cookies.get(req, Cookies.Groupme);
  integrationCheck: if (!state.profile && groupmeIntegrationString) {
    let groupmeIntegration: GroupmeIntegration | undefined;
    try {
      groupmeIntegration = JSON.parse(groupmeIntegrationString);
    } catch {
      updateErrors(
        state,
        `Failed to parse groupme integration, got: '${groupmeIntegrationString}'`,
      );
      break integrationCheck;
    }
    if (!groupmeIntegration?.accessToken) {
      updateErrors(
        state,
        `Failed to get accessToken out of groupme integration, got: '${groupmeIntegration}' `,
      );
      break integrationCheck;
    }
    const groupmeResult = await groupmeLogin(groupmeIntegration.accessToken, {
      userId: Cookies.get(req, Cookies.Token),
      userAgent: new UserAgent(req.headers.get("user-agent")),
    });
    if (!groupmeResult.success) {
      updateErrors(state, groupmeResult.errors);
      break integrationCheck;
    }
    const { sessionId } = groupmeResult;
    if (sessionId) {
      const headers = new Headers();
      // set cookie and refresh to home for normal authentication
      Cookies.set({
        headers,
        cookie: { name: Cookies.Auth, value: sessionId },
      });
      // don't need token or groupme stuff anymore
      Cookies.clear(headers, [Cookies.Token, Cookies.Groupme]);
      return makeRedirectResponse(headers, "/");
    }
  }
  console.error("Errors:", state.errors);

  // clear errors in error cookie if there are any
  // return any route requested
  const response = await ctx.next();

  Cookies.clear(response.headers, Cookies.Error);
  return response;
});
