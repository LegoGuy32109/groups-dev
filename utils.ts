import { createDefine } from "fresh";
import { Profile } from "./types/entities/Profile.ts";
import { Session } from "./types/entities/Session.ts";

// This specifies the type of "ctx.state"
export interface State {
  today: string;
  session?: Session;
  profile?: Profile;
  errors?: Array<string>;
  urlPath?: string;
}

export const define = createDefine<State>();

const MAX_ERRORS = 10;

export function updateErrors(state: State, newError: string | Array<string>) {
  const newErrors = Array.isArray(newError) ? newError : [newError];
  state.errors = [...newErrors, ...(state.errors ?? [])].slice(0, MAX_ERRORS);
}

/**
 * Redirect to app index '/' if no location specified
 */
export function makeRedirectResponse(
  headers: Headers,
  location = "/",
): Response {
  headers.set("location", location);
  return new Response(null, { status: 303, headers });
}
