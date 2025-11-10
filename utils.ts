import { createDefine } from "fresh";
import { Profile } from "./types/entities/Profile.ts";
import { Session } from "./types/entities/Session.ts";
import { ErrorList } from "./utilities/Errors.ts";

// This specifies the type of "ctx.state"
export interface State {
  today: string;
  session?: Session;
  profile?: Profile;
  errors?: ErrorList;
  urlPath?: string;
}

export const define = createDefine<State>();

const MAX_ERRORS = 10;

export function updateErrors(state: State, newError: string | ErrorList) {
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

export function makeJsonResponse(
  object: unknown,
  status: number,
  headers?: Headers,
): Response {
  return new Response(JSON.stringify(object), {
    status,
    headers: {
      ...new Headers(headers),
      "Content-Type": "application/json",
    },
  });
}

export function makeErrorResponse(
  error: string | ErrorList,
  status = 400,
): Response {
  const errors = Array.isArray(error) ? error : [error];
  return makeJsonResponse({ errors }, status);
}
