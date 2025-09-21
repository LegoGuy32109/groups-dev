import { define, makeRedirectResponse } from "../../utils.ts";
import { Cookies } from "../../utilities/Cookies.ts";
import { login } from "../../utilities/security.ts";

export const handler = define.handlers({
  async POST({ req }) {
    const form = await req.formData();
    const username = String(form.get("username"));
    const password = String(form.get("password"));
    const loginResult = await login(username, password);

    // Login failed, redirect to login again with error
    if (!loginResult.success) {
      const headers = new Headers();
      Cookies.setErrors(headers, loginResult.errors);
      return makeRedirectResponse(headers, "/login");
    }

    // Login succeeded
    const headers = Cookies.set({
      cookie: {
        name: Cookies.Auth,
        value: loginResult.sessionId,
      },
    });
    return makeRedirectResponse(headers);
  },
});
