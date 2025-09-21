import { define, makeRedirectResponse } from "../../utils.ts";
import { Cookies } from "../../utilities/Cookies.ts";

export const handler = define.handlers({
  POST() {
    // const form = await req.formData();
    // const username = String(form.get("username"));
    // const password = String(form.get("password"));

    const headers = new Headers();
    Cookies.setErrors(headers, "api/login is deprecated");
    return makeRedirectResponse(headers, "/login");
  },
});
