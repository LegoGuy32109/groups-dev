import { MiddlewareHandler } from "$fresh/server.ts";
import { Profile } from "../../types/entities/Profile.ts";
import { Session } from "../../types/entities/Session.ts";
import { Cookies } from "../../utilities/Cookies.ts";
import { Db } from "../../utilities/Database.ts";

export interface AppState {
  session?: Session;
  profile?: Profile;
  errors?: Array<string>;
  urlPath?: string;
}
export const handler: MiddlewareHandler<AppState> = async (req, ctx) => {
  // default to unauthenticated
  ctx.state = {
    session: undefined,
    profile: undefined,
    errors: undefined,
    // indicate what path the user is on
    urlPath: ctx.url.pathname,
  };
  console.log(ctx.state.urlPath);
  // if an auth cookie exists with session id, attempt to access it
  const sessionId = Cookies.get(req, Cookies.Auth);
  if (sessionId) {
    const sessionResult = await Db.getSession(sessionId);
    if (sessionResult.success) {
      const profileResult = await Db.getUser(sessionResult.session.userId);
      if (profileResult.success) {
        ctx.state = {
          session: sessionResult.session,
          profile: profileResult.profile,
        };
      } else {
        ctx.state.errors = profileResult.errors;
      }
    } else {
      ctx.state.errors = sessionResult.errors;
    }
  }
  // return any route requested
  const response = await ctx.next();
  // debug errors in error cookie if there are any
  if (ctx.state.errors) {
    Cookies.set({
      headers: response.headers,
      cookie: { name: Cookies.Error, value: JSON.stringify(ctx.state.errors) },
    });
  }
  return response;
};
