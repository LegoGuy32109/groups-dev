import { define } from "../../utils.ts";

export const handler = define.middleware((ctx) => {
  const { state, url } = ctx;
  // indicate what path the user is on
  state.urlPath = url.pathname;
  return ctx.next();
});
