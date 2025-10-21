import { IS_BROWSER } from "fresh/runtime";
import {
  deleteItem,
  openGroupsDb,
  readTable,
  saveUserData,
} from "../data/IndexDb.ts";
import { useSignal } from "@preact/signals";
import { Dates } from "../utilities/Dates.ts";

export default function IndexedDbAccess() {
  const logins = useSignal<Array<[unknown, unknown]>>();

  if (IS_BROWSER) {
    (async () => {
      await openGroupsDb();
      const total = await readTable("locations", {
        // direction: "prev",
        // limit: 2,
        // excludeStartAtValue: true,
        // startAtValue: "2025-10-21T02:29:08.576Z",
      });
      logins.value = total;
    })();
  }
  return (
    <div class="text-fuchsia-50 opacity-90 flex flex-col w-screen h-screen justify-center items-center">
      <h1 class="text-6xl pb-2">Logins</h1>
      <div class="block max-h-7/12 max-w-11/12 overflow-y-auto px-8">
        <ul class="m-1 text-sm font-mono font-normal list-decimal gap-0.5 flex flex-col whitespace-nowrap">
          {logins.value?.map(([key, userAgent]) => (
            <li
              key={key}
              onDblClick={() => deleteItem("locations", String(key))}
            >
              {Dates.formatIso(String(key))} -{" "}
              <span class="text-xs block truncate max-w-full">{String(userAgent)}</span>
            </li>
          ))}
        </ul>
      </div>
      <button type="button" onClick={() => saveUserData()}>New +</button>
    </div>
  );
}
