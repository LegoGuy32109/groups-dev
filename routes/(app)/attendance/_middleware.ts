import { define, makeRedirectResponse, updateErrors } from "../../../utils.ts";

export const handler = define.middleware((ctx) => {
  // if unauthenticated, reroute to login
  if (!ctx.state.profile) {
    updateErrors(ctx.state, "Must be authenticated");
    return makeRedirectResponse(new Headers(ctx.req.headers), "/login");
  }
  return ctx.next();
});
