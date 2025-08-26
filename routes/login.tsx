import LoginFrom from "../islands/LoginForm.tsx";
import { Handler } from "$fresh/server.ts";

export const handler: Handler = async (req, ctx) => {
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
  console.log(loginDetails);

  return ctx.render();
};
export default function LoginPage() {
  return (
    <div class="w-full h-screen min-h-full bg-slate-800 flex flex-col items-center overflow-auto">
      <h1 class="font-semibold text-3xl text-slate-600 leading-relaxed tracking-wider">
        Login to e91Students
      </h1>
      <LoginFrom />
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
