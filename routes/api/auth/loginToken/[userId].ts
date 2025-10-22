import { createLoginToken } from "../../../../utilities/security.ts";
import { define, makeJsonResponse } from "../../../../utils.ts";

export const handler = define.handlers({
  async GET({ params }) {
    // TODO: check for auth
    if (!params.userId) {
      return makeJsonResponse({ errors: ["No userId in request."] }, 400);
    }
    const response = await createLoginToken(params.userId);
    if (!response.ok) {
      return makeJsonResponse({ errors: response.errors }, 400);
    }

    return makeJsonResponse({ token: response.token }, 201);
  },
});
