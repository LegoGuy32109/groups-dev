import LoginFrom from "../../islands/LoginForm.tsx";
import { Handler, PageProps } from "$fresh/server.ts";
import { Cookies } from "../../utilities/Cookies.ts";
import { AppState } from "./_middleware.ts";

interface LoginInfo {
  username?: string;
  password?: string;
}

export const handler: Handler<LoginInfo, AppState> = async (req, ctx) => {
  // if you were redirected from api with error,
  // set error state with that message
  const errorMessage = Cookies.get(req, Cookies.Error);
  console.log("error", errorMessage);
  if (errorMessage) {
    ctx.state.errors = [errorMessage];
    const response = await ctx.render();
    Cookies.clear(response.headers, Cookies.Error);
    return response;
  }

  // check if token exists for first time sign-in
  const url = new URL(req.url);
  const possibleToken = url.searchParams.get("token");
  if (!possibleToken) return ctx.render(); // skip if it doesn't

  // token exists, attempt to grab from db
  const tokenUrl = new URL("/api/prefill", req.url);
  const loginDetails = await fetch(tokenUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token: possibleToken }),
  });
  // couldn't grab token from db
  if (!loginDetails.ok) {
    const error = await loginDetails.text();
    ctx.state.errors = [error];
    return ctx.render();
  }
  // got token from db
  const loginInfo: LoginInfo = await loginDetails.json();
  return ctx.render(loginInfo);
};
export default function LoginPage(
  { state, data = {} }: PageProps<LoginInfo, AppState>,
) {
  return (
    <div class="w-full h-screen min-h-full bg-slate-800 flex flex-col items-center justify-center overflow-auto">
      <h1 class="font-semibold text-3xl text-slate-600 leading-relaxed tracking-wider">
        Login to e91Students
      </h1>
      <LoginFrom username={data.username} password={data.password} />
      <p class="text-red-700 mt-2 font-mono">
        {JSON.stringify(state.errors?.[0])}
      </p>
    </div>
  );
}
