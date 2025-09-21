import { Head } from "fresh/runtime";
import { define, makeRedirectResponse, updateErrors } from "../../utils.ts";
import { PersonalVerse } from "../../components/PersonalVerse.tsx";
import GroupOverview from "../../islands/GroupOverview.tsx";
import { page } from "fresh";

export const handler = define.handlers({
  GET({ req, state }) {
    // if unauthenticated, reroute to login
    if (!state.profile) {
      updateErrors(state, "Must be authenticated");
      return makeRedirectResponse(new Headers(req.headers), "/login");
    }
    return page();
  },
});

export default define.page(
  function Home({ state }) {
    return (
      <>
        <Head>
          <title>E91Students - Home</title>
        </Head>
        <PersonalVerse name={state.profile?.firstName} />
        <GroupOverview state={state} />
      </>
    );
  },
);
