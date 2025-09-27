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
        <div class="flex flex-col w-full justify-start p-4 text-slate-300">
          <h1 class="text-3xl">E91Students Profiles</h1>
          <button
            type="button"
            class="my-4 bg-blue-800 rounded-3xl font-semibold text-2xl ring-slate-400 ring-1"
          >
            New +
          </button>
          <ul class="flex flex-col gap-2">
            {result.success &&
              result.profileRecords.map((record) => (
                <li key={record.key}>
                  <details>
                    <summary class="font-semibold">
                      <span
                        class={`${
                          record.value.groupme ? "text-blue-500" : ""
                        }`}
                      >
                        {record.value.firstName} {record.value.lastName}
                      </span>{" "}
                      <i class="font-medium text-[8px]">
                        {record.key.at(1)?.toString() ?? "<no id>"}
                      </i>
                    </summary>
                    <p>{JSON.stringify(record, undefined, "  ")}</p>
                  </details>
                </li>
              ))}
          </ul>
        </div>
      </>
    );
  },
);
