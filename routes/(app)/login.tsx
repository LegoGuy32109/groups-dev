import { page } from "fresh";
import { define, updateErrors } from "../../utils.ts";
import { Db } from "../../utilities/Database.ts";
import { Cookies } from "../../utilities/Cookies.ts";
import { Profile } from "../../types/entities/Profile.ts";
import { Users } from "../../data/Users.ts";
import Conditional from "../../components/Conditional.tsx";

export const handler = define.handlers({
  async GET({ req, state }) {
    // check if token exists for first time sign-in
    const url = new URL(req.url);
    const possibleToken = url.searchParams.get("token");
    if (!possibleToken) return page(); // skip if it doesn't

    // token exists, attempt to grab from db
    const tokenResult = await Db.getTokenValue(possibleToken);
    // couldn't grab token from db
    if (!tokenResult.success) {
      updateErrors(state, tokenResult.errors);
      return page();
    }
    const { userId } = tokenResult;

    const result = await Users.getUserProfile(userId);
    if (!result.success) {
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
          <Conditional visible={!!GROUPME_AUTH_REDIRECT_URL}>
            <GroupmeLogin profile={data?.profile} />
            <p class="text-red-700 mt-2 font-mono">
              No GROUPME_AUTH_REDIRECT_URL is set for this deployment.
            </p>
          </Conditional>
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
