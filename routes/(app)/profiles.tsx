import { Head } from "fresh/runtime";
import { define, makeRedirectResponse, updateErrors } from "../../utils.ts";
import { page } from "fresh";
import { Users } from "../../data/Users.ts";
import { Dates } from "../../utilities/Dates.ts";
import { MdGroup } from "@preact-icons/md";
import Conditional from "../../components/Conditional.tsx";
import CopyButton from "../../islands/CopyButton.tsx";
import DeleteUserButton from "../../islands/DeleteUserButton.tsx";
import LoginCode from "../../islands/LoginCode.tsx";

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
  async function Page() {
    const result = await Users.getAllProfileRecords();

    return (
      <>
        <Head>
          <title>E91Students - Profiles</title>
        </Head>
        <div class="flex flex-col w-full justify-start p-4 text-slate-300">
          <h1 class="text-3xl">Group Leader Profiles</h1>
          <button
            type="button"
            class="my-4 bg-blue-800 rounded-3xl font-semibold text-2xl ring-slate-400 ring-1 max-w-[400px]"
          >
            New +
          </button>
          <ul class="flex flex-col gap-2 wrap-break-word">
            {result.success &&
              result.profileRecords.map(({ key, value }) => (
                <li key={key}>
                  <details>
                    <summary class="flex items-center-safe gap-2 font-semibold">
                      <span
                        class={`flex items-end gap-1 ${
                          value.groupme ? "text-blue-500" : ""
                        }`}
                      >
                        <Conditional visible={!!value.groupme}>
                          <MdGroup class="pb-1" />
                        </Conditional>
                        {value.firstName} {value.lastName}
                      </span>{" "}
                      <i class="font-medium text-[8px]">
                        {key.at(1)?.toString() ?? "<no id>"}
                      </i>
                    </summary>
                    <div class="relative">
                      <div class="absolute right-1 top-1">
                        <DeleteUserButton
                          userId={key.at(1)?.toString()}
                          profile={value}
                        />
                      </div>
                      <ul class="mb-1 rounded-xl bg-slate-900/50 pt-2 p-1">
                        <li>
                          Default Group:{" "}
                          {value.defaultGroup ?? "<no default group>"}
                        </li>
                        <li>
                          GroupMe Integrated: {value.groupme ? "✅" : "❌"}
                        </li>
                        <li>
                          Updated On: {Dates.formatIso(value.updatedOn)}
                        </li>
                        <li>
                          Created On: {Dates.formatIso(value.createdOn)}
                        </li>
                        <li>
                          <LoginCode
                            profile={value}
                            userId={key.at(1)?.toString()}
                          />
                        </li>
                        <li class="flex text-xs text-slate-500 mt-1">
                          <CopyButton
                            value={JSON.stringify(value, undefined, 2)}
                          />
                          <details>
                            <summary class="flex ml-1">
                              Object Value
                            </summary>
                            <pre class="whitespace-pre-wrap text-slate-300">
                             <code>{JSON.stringify(value, undefined, 2)}</code>
                            </pre>
                          </details>
                        </li>
                      </ul>
                    </div>
                  </details>
                </li>
              ))}
          </ul>
        </div>
      </>
    );
  },
);
