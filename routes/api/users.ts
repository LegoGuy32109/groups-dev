import { Users } from "../../data/Users.ts";
import { Cookies } from "../../utilities/Cookies.ts";
import { define, makeJsonResponse } from "../../utils.ts";

export const handler = define.handlers({
  async GET({ req }) {
    const sessionId = Cookies.get(req.headers, Cookies.Auth);
    if (!sessionId) return new Response("Unauthenticaed", { status: 401 });

    const requestBody = await req.json();
    console.log(requestBody);
    return new Response();
  },
  POST() {
    return new Response();
  },
  PATCH() {
    return new Response();
  },
  async DELETE({ req, params }) {
    try {
       console.log(req, params)
      const sessionId = Cookies.get(req.headers, Cookies.Auth);
      if (!sessionId) return new Response("Unauthenticaed", { status: 401 });

      // TODO: make sure they have permission

      if (!params.id) {
        return makeJsonResponse(
          { errors: ["Missing user 'id' to delete."] },
          400,
        );
      }

      const result = await Users.deleteUser(params.id);
      if (!result.success) {
        return makeJsonResponse({ errors: result.errors }, 404);
      }
      const { deletedRecords } = result;
      if (deletedRecords.length === 0) {
        return makeJsonResponse({ deletedRecords }, 204);
      }
      return makeJsonResponse({ deletedRecords }, 200);
    } catch (err) {
      console.error("Error deleting user:", err);
      return makeJsonResponse({ errors: ["Internal server error", err] }, 500);
    }
  },
});
