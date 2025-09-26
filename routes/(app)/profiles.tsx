import { Head } from "fresh/runtime";
import { define, makeRedirectResponse, updateErrors } from "../../utils.ts";
import { page } from "fresh";
import { Users } from "../../data/Users.ts";

export const handler = define.handlers({
  GET({ req, state }) {
    // TODO: if lacking permissions
    // if unauthenticated, reroute to login
    if (!state.profile) {
      updateErrors(state, "Must be authenticated");
      return makeRedirectResponse(new Headers(req.headers), "/login");
    }
    return page();
  },
});

export default define.page<typeof handler>(
  async function Page({ state }) {
    const result = await Users.getAllProfileRecords();
    return (
      <>
        <Head>
          <title>E91Students - Profiles</title>
        </Head>
        <div>
          <h1>E91Students Profiles</h1>
          <ul class="text-slate-300 flex flex-col gap-2">
            {result.success &&
              result.profileRecords.map((record) => (
                <li key={record.key}>
                  {JSON.stringify(record, undefined, "  ")}
                </li>
              ))}
          </ul>
        </div>
      </>
    );
  },
);
