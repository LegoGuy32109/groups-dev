import { Users } from "../../../data/Users.ts";
import { Cookies } from "../../../utilities/Cookies.ts";
import { signup } from "../../../utilities/security.ts";
import {
  define,
  makeJsonResponse,
  makeRedirectResponse,
} from "../../../utils.ts";

export const handler = define.handlers({
  GET({ req }) {
    const sessionId = Cookies.get(req.headers, Cookies.Auth);
    if (!sessionId) return new Response("Unauthenticaed", { status: 401 });

    return new Response();
  },
  async POST({ req, params }) {
    const sessionId = Cookies.get(req.headers, Cookies.Auth);
    if (!sessionId) return new Response("Unauthenticaed", { status: 401 });

    const { id } = params;
    if (!id) {
      return makeJsonResponse(
        { errors: ["Missing user id in route param."] },
        400,
      );
    }

    const form = await req.formData();
    const firstName = (form.get("firstName") ?? "").toString().trim();
    const lastName = (form.get("lastName") ?? "").toString().trim();

    const userSuccess = await signup(firstName, lastName);
    if (!userSuccess.success) {
      return makeJsonResponse({ errors: userSuccess.errors }, 400);
    }

    return makeRedirectResponse(new Headers(req.headers), "/profiles");
  },
  PATCH() {
    return new Response();
  },
  async DELETE({ req, params }) {
    try {
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
