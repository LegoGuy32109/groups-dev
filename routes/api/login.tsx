import { Handlers, PageProps } from "$fresh/server.ts";
import { setCookie } from "$std/http/cookie.ts";

// TODO: encode data if username exists or not
interface LoginRequest {
  username: string;
  password: string;
}

export const handler: Handlers = {
  async POST(req, ctx) {
    const url = new URL(req.url);
    const form = await req.formData();
    const loginRequest: LoginRequest = {
      username: String(form.get("username")),
      password: String(form.get("password")),
    };

    // get user from database and see if password hash matches
    if (loginRequest.username === "deno" && loginRequest.password === "land") {
      const headers = new Headers();
      setCookie(headers, {
        name: "e91-students-auth",
        value: "bar", // should be a unique value for each session
        sameSite: "Lax",
        domain: url.hostname,
        path: "/",
        secure: true,
      });
      headers.set("location", "/");
      return new Response(null, {
        status: 303, // redirect
        headers,
      });
    } else {
      // Login failed, display option to login again
      return await ctx.render(loginRequest);
    }
  },
};

export default function LoginPage(
  { data: loginForm }: PageProps<LoginRequest>,
) {
  return (
    <div>
      Invalid Login for user "{loginForm.username}", please try again.
    </div>
  );
}
