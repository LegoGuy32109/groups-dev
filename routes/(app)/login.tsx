import { page } from "fresh";
import { define } from "../../utils.ts";
import { Cookies } from "../../utilities/Cookies.ts";

interface LoginInfo {
  username?: string;
  password?: string;
}

// export const handler: Handler<LoginInfo, AppState> = async (req, ctx) => {
export const handler = define.handlers({
  async GET(ctx) {
    const { req } = ctx;
    // if you were redirected from api with error,
    // set error state with that message
    const errorMessage = Cookies.get(req, Cookies.Error);
    if (errorMessage) {
      ctx.state.errors = [errorMessage];
      const response = page();
      Cookies.clear(new Headers(response.headers), Cookies.Error);
      return response;
    }

    // check if token exists for first time sign-in
    const url = new URL(req.url);
    const possibleToken = url.searchParams.get("token");
    if (!possibleToken) return page(); // skip if it doesn't

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
      return page();
    }
    // got token from db
    const loginInfo: LoginInfo = await loginDetails.json();
    return page({ loginInfo });
  },
});

export default define.page<typeof handler>(
  ({ state, data }) => {
    const { username, password } = data?.loginInfo ?? {};
    return (
      <div class="w-full h-screen min-h-full bg-slate-800 flex flex-col items-center justify-center overflow-auto">
        <h1 class="font-semibold text-3xl text-slate-600 leading-relaxed tracking-wider">
          Login to e91Students
        </h1>
        <form
          method="post"
          action="/api/login"
          class="flex flex-col bg-slate-600 rounded-md gap-2 p-5 font-semibold shadow-lg shadow-slate-900/90"
        >
          <label class="text-slate-300 flex justify-between gap-4">
            Username:{" "}
            <input
              type="text"
              name="username"
              autocomplete="username"
              value={username}
              required
              class="px-1 rounded-lg bg-slate-200 text-slate-800 font-normal"
            />
          </label>
          <label class="text-slate-300 flex justify-between gap-4">
            Password:{" "}
            <input
              type="password"
              name="password"
              value={password}
              autocomplete="current-password"
              required
              class="px-1 rounded-lg bg-slate-200 text-slate-800 font-normal"
            />
          </label>
          <div class="flex justify-between items-center">
            <a href="/" class="underline text-slate-800">
              Forgot Password?
            </a>
            <button
              type="submit"
              class="rounded-full text-slate-200 m-1 p-2 min-w-20
          bg-gradient-to-r from-sky-600 to-sky-300 bg-[length:150%_150%] transition-[background-position] duration-300 hover:bg-[position:90%_90%]"
            >
              Submit
            </button>
          </div>
        </form>
        <p class="text-red-700 mt-2 font-mono">
          {JSON.stringify(state.errors?.[0])}
        </p>
      </div>
    );
  },
);
