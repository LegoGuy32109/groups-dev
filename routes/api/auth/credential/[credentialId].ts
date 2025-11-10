import { Users } from "../../../../data/Users.ts";
import {
  define,
  makeErrorResponse,
  makeJsonResponse,
} from "../../../../utils.ts";

export const handler = define.handlers({
  async GET({ params }) {
    if (!params.credentialId) {
      return makeErrorResponse("Failed to provide credential id");
    }

    const credentialResult = await Users.getCredential(params.credentialId);
    if (!credentialResult.ok) {
      return makeErrorResponse(credentialResult.errors);
    }

    console.log("found it!", credentialResult);
    return makeJsonResponse(credentialResult, 200);
  },
});
