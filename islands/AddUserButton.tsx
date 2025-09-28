import { useSignal } from "@preact/signals";
import Conditional from "../components/Conditional.tsx";

const inputClass = "bg-slate-200 rounded-sm text-slate-900";

export default function AddUserButton() {
  const formOpen = useSignal(false);
  const newUserId = crypto.randomUUID();
  return (
    <div class="my-4 w-full">
      <Conditional visible={!formOpen.value}>
        <button
          type="button"
          class="bg-blue-800 rounded-3xl font-semibold text-2xl ring-slate-400 ring-1 w-full max-w-[300px]"
          onClick={() => formOpen.value = true}
        >
          New +
        </button>
        <form method="post" action={`/api/users/${newUserId}`}>
          <ul class="flex flex-col gap-2">
            <li>
              <label class="block">
                First Name{" "}
                <input
                  class={inputClass}
                  type="text"
                  name="firstName"
                  required
                />
              </label>
            </li>
            <li>
              <label class="block">
                Last Name{" "}
                <input
                  class={inputClass}
                  type="text"
                  name="lastName"
                  required
                />
              </label>
            </li>
            <li>
              <button
                type="submit"
                class="bg-slate-900 rounded-md p-2 font-semibold"
              >
                Submit
              </button>
              <button
                type="button"
                class="ml-5 bg-slate-400 rounded-md p-2 text-slate-900"
                onClick={() => formOpen.value = false}
              >
                Cancel
              </button>
            </li>
          </ul>
        </form>
      </Conditional>
    </div>
  );
}
