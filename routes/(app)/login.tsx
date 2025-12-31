import { page } from "fresh";
import { define, updateErrors } from "../../utils.ts";
import { Db } from "../../utilities/Database.ts";
import { Cookies } from "../../utilities/Cookies.ts";
import { Users } from "../../data/Users.ts";
import { Sessions } from "../../data/Sessions.ts";
import Conditional from "../../components/Conditional.tsx";
import SetupBioAuth from "../../islands/SetupBioAuth.tsx";
import { UserAgent } from "@std/http/user-agent";
import { makeRedirectResponse } from "../../utils.ts";

export const handler = define.handlers({
  async GET({ req, state }) {
    // check if token exists for first time sign-in
    const url = new URL(req.url);
    const possibleToken = url.searchParams.get("token");
    if (!possibleToken) return page(); // skip if it doesn't

    // token exists, attempt to grab from db
    const tokenResult = await Db.getTokenEntry(possibleToken);
    // couldn't grab token from db
    if (!tokenResult.ok) {
      updateErrors(state, tokenResult.errors);
      return page();
    }
    const { userId } = tokenResult;

    const result = await Users.getProfile(userId);
    if (!result.ok) {
      updateErrors(state, result.errors);
      return page();
    }

    // got token from db, store temporarily in cookies
    const response = page({ profile: result.profile });
    response.headers = Cookies.set({
      headers: new Headers(response.headers),
      cookie: {
        name: Cookies.Token,
        value: userId,
        maxAge: 24 * 60 * 60,
      },
    });
    return response;
  },
  async POST({ req, state }) {
    const form = await req.formData();
    console.log("got form data");
    const possibleToken = String(form.get("accessCode") ?? "").trim();
    if (!possibleToken) {
      updateErrors(state, "Missing access code.");
      return page();
    }

    const tokenResult = await Db.consumeToken(possibleToken);
    console.log("consumed token");
    if (!tokenResult.ok) {
      updateErrors(state, tokenResult.errors);
      return page();
    }

    const { userId } = tokenResult;
    const sessionResult = await Sessions.login(userId, {
      userAgent: new UserAgent(req.headers.get("user-agent")),
    });
    console.log("logging in");
    if (!sessionResult.ok) {
      updateErrors(state, sessionResult.errors);
      return page();
    }

    console.log("setting cookied");
    const headers = Cookies.set({
      headers: new Headers(req.headers),
      cookie: {
        name: Cookies.Auth,
        value: sessionResult.sessionId,
        maxAge: 14 * 24 * 3600,
      },
    });
    return makeRedirectResponse(headers, "/");
  },
});

const GROUPME_AUTH_REDIRECT_URL = Deno.env.get("GROUPME_AUTH_REDIRECT_URL");

export default define.page<typeof handler>(
  ({ state, data }) => {
    // if already logged in, prevent UI to login again
    if (state.session && state.profile) {
      return (
        <>
          <h1 class="m-5 font-medium text-3xl text-slate-500 max-w-[350px]">
            You're already logged in {state.profile.firstName},{" "}
            <a href="/api/logout" class="font-bold text-red-300">Logout?</a>
          </h1>
          <SetupBioAuth
            userId={state.session.userId}
          />
        </>
      );
    }

    // this is profile parsed from token
    const { firstName, lastName } = data?.profile ?? {};

    return (
      <div class="w-full h-screen min-h-full bg-slate-800 flex flex-col items-center justify-center overflow-auto">
        <h1 class="font-semibold text-5xl text-slate-500 leading-relaxed tracking-wider text-shadow-md text-shadow-slate-900/90">
          Login to Groups
        </h1>
        <div class="bg-slate-600 rounded-md p-5 font-semibold shadow-lg shadow-slate-900/90">
          <Conditional visible={!!GROUPME_AUTH_REDIRECT_URL}>
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
                  {firstName && (
                    <>
                      <p>Connect account for</p>
                      <p>{firstName} {lastName}</p>
                    </>
                  )}
                </div>
              </div>
            </a>
          </Conditional>
          <Conditional visible={!GROUPME_AUTH_REDIRECT_URL}>
            <p class="text-red-400 mt-2 font-mono">
              No GROUPME_AUTH_REDIRECT_URL is set for this deployment.
            </p>
          </Conditional>
          <div class="bg-slate-400 text-slate-800 rounded-md mt-4 p-2">
            <form method="post">
              <label>
                I have an access code:{" "}
                <input
                  class="ml-1 mr-4 px-1 bg-slate-100 rounded-md w-20"
                  name="accessCode"
                  type="text"
                />
              </label>
              <button
                class="bg-slate-600 rounded-full text-slate-200 font-bold px-3 py-1 text-sm"
                type="submit"
              >
                Submit
              </button>
            </form>
          </div>
        </div>
        <SetupBioAuth userId={state.session?.userId} />
        <p class="text-red-400 mt-2 font-mono">
          {JSON.stringify(state.errors?.[0])}
        </p>
      </div>
    );
  },
);
