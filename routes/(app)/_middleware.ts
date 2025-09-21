import { define, updateErrors } from "../../utils.ts";
import { Cookies } from "../../utilities/Cookies.ts";
import { Db } from "../../utilities/Database.ts";

export const handler = define.middleware(async (ctx) => {
  const { req, state, url } = ctx;
  // indicate all state values don't exist yet
  state.session = undefined;
  state.profile = undefined;
  state.errors = undefined;
  // indicate what path the user is on
  state.urlPath = url.pathname;
  console.log(state.urlPath);

  // get existing errors into state
  state.errors = Cookies.getErrors(req.headers);

  // if an auth cookie exists with session id, attempt to access it
  const sessionId = Cookies.get(req, Cookies.Auth);
  if (sessionId) {
    const sessionResult = await Db.getSession(sessionId);
    if (sessionResult.success) {
      const profileResult = await Db.getUser(sessionResult.session.userId);
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

  // return any route requested
  const response = await ctx.next();
  // clear errors in error cookie if there are any
  Cookies.clear(response.headers, Cookies.Error);
  return response;
});
