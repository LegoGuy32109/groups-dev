import { page } from "fresh";
import { define, updateErrors } from "../../utils.ts";
import { Db } from "../../utilities/Database.ts";
import { Cookies } from "../../utilities/Cookies.ts";
import { Profile } from "../../types/entities/Profile.ts";

export const handler = define.handlers({
  async GET({ req, state }) {
    // check if token exists for first time sign-in
    const url = new URL(req.url);
    const possibleToken = url.searchParams.get("token");
    if (!possibleToken) return page(); // skip if it doesn't
    console.log(possibleToken);

    // token exists, attempt to grab from db
    const kv = await Db.kv();
    const tokenResult = await kv.get<
      { userId: string }
    >(["tokens", possibleToken]);
    console.log(tokenResult);
    const { value } = tokenResult;

    // couldn't grab token from db
    if (!value) {
      updateErrors(state, `Invalid or Expired token '${possibleToken}'`);
      return page();
    }

    const result = await Db.getUserProfile(value.userId);
    if (!result.success) {
      updateErrors(state, result.errors);
      return page();
    }

    const response = page({ profile: result.profile });
    // got token from db, store temporarily in cookies
    const headers = new Headers(response.headers);
    Cookies.set({
      headers,
      cookie: {
        name: Cookies.Token,
        value: value.userId,
        maxAge: 24 * 60 * 60,
      },
    });
    response.headers = headers;
    return response;
  },
});

const GROUPME_AUTH_REDIRECT_URL = Deno.env.get("GROUPME_AUTH_REDIRECT_URL");

export default define.page<typeof handler>(
  ({ state, data }) => {
    // if already logged in, prevent UI to login again
    if (state.profile) {
      return (
        <h1 class="m-5 font-medium text-3xl text-slate-500 max-w-[350px]">
          You're already logged in,{" "}
          <a href="/api/logout" class="font-bold text-red-300">Logout?</a>
        </h1>
      );
    }

    return (
      <div class="w-full h-screen min-h-full bg-slate-800 flex flex-col items-center justify-center overflow-auto">
        <h1 class="font-semibold text-3xl text-slate-500 leading-relaxed tracking-wider">
          Login to e91Students
        </h1>
        <div class="bg-slate-600 rounded-md p-5 font-semibold shadow-lg shadow-slate-900/90">
          {GROUPME_AUTH_REDIRECT_URL
            ? <GroupmeLogin profile={data?.profile} />
            : <Form />}
        </div>
        <p class="text-red-700 mt-2 font-mono">
          {JSON.stringify(state.errors?.[0])}
        </p>
      </div>
    );
  },
);

function GroupmeLogin({ profile }: { profile?: Profile }) {
  const { firstName, lastName } = profile ?? {};

  return (
    <a href={GROUPME_AUTH_REDIRECT_URL}>
      <div class="flex items-center gap-4 bg-[#1850b6] rounded-3xl p-2">
        <img
          alt="groupme logo"
          width="100"
          height="100"
          class="p-1"
          src="https://web.groupme.com/images/svg-icons/groupme-logo-base.svg"
        />
        <div class="flex flex-col text-white font-medium mr-4">
          <p>Login with GroupMe</p>
          {profile && <p>Connect account for {firstName} {lastName}</p>}
        </div>
      </div>
    </a>
  );
}

function Form(
  { visible = true, username, password }: {
    visible?: boolean;
    username?: string;
    password?: string;
  },
) {
  if (!visible) {
    return;
  }

  return (
    <form
      method="post"
      action="/api/login"
      class="flex flex-col gap-2"
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
  );
}
