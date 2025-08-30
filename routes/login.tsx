import LoginFrom from "../islands/LoginForm.tsx";
import { Handler, PageProps } from "$fresh/server.ts";
import { Cookies } from "../utilities/Cookies.ts";

export const handler: Handler = async (req, ctx) => {
  // if you were redirected from api with error
  const errorMessage = Cookies.get(req, Cookies.Error);
  if (errorMessage) {
    const response = await ctx.render({ error: errorMessage });
    const clearedResponse = Cookies.clear(response, Cookies.Error);
    return clearedResponse;
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
    return ctx.render({ error: await loginDetails.text() });
  }
  // got token from db
  const loginInfo: { password: string; username: string } = await loginDetails
    .json();
  return ctx.render(loginInfo);
};
export default function LoginPage(
  { data = {} }: PageProps<
    { username?: string; password?: string; error?: string }
  >,
) {
  return (
    <div class="w-full h-screen min-h-full bg-slate-800 flex flex-col items-center overflow-auto">
      <h1 class="font-semibold text-3xl text-slate-600 leading-relaxed tracking-wider">
        Login to e91Students
      </h1>
      <LoginFrom username={data.username} password={data.password} />
      <p class="text-red-700 mt-2 font-mono">{data.error}</p>
    </div>
  );
}
//function Logout() {
//  return (
//    <form method="get" action="/api/logout">
//      <button
//        type="submit"
//        class="rounded-full bg-sky-500 hover:bg-sky-400 text-slate-200 m-1 p-2 font-bold text-xs"
//      >
//        Logout
//      </button>
//    </form>
//  );
//}
