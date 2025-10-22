import IDB, { Tables } from "../data/IndexedDB.ts";
import { useSignal } from "@preact/signals";
import { Dates } from "../utilities/Dates.ts";
import { useEffect } from "preact/hooks";

export default function IndexedDbAccess() {
  const logins = useSignal<Array<[unknown, unknown]>>();

  async function refresh() {
    const result = await IDB.readTable(Tables.Locations, {
      direction: "prev",
    });
    if (result.ok) {
      logins.value = result.total;
    } else {
      console.error(result.errors);
    }
  }

  // load data on mount, only in browser
  useEffect(() => {
    refresh();
  }, []);

  return (
    <div class="text-fuchsia-50 opacity-90 flex flex-col w-screen h-screen justify-center items-center">
      <h1 class="text-6xl pb-2">Logins</h1>
      <div class="block max-h-7/12 max-w-11/12 overflow-y-auto px-8">
        <ul class="m-1 text-sm font-mono font-normal list-decimal gap-0.5 flex flex-col whitespace-nowrap">
          {logins.value?.map(([key, userAgent]) => (
            <li
              key={key}
              onDblClick={async () => {
                const deleteResult = await IDB.deleteItem(
                  Tables.Locations,
                  String(key),
                );
                if (!deleteResult.ok) {
                  console.error(deleteResult.errors);
                  return;
                }
                refresh();
              }}
            >
              {Dates.formatIso(String(key))} -{" "}
              <span class="text-xs block truncate max-w-full">
                {String(userAgent)}
              </span>
            </li>
          ))}
        </ul>
      </div>
      <button
        type="button"
        onClick={async () => {
          const updateResult = await IDB.saveLogin();
          if (!updateResult.ok) console.error(updateResult.errors);
          refresh();
        }}
      >
        New +
      </button>
    </div>
  );
}
