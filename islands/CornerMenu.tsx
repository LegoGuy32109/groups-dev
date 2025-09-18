import { useSignal } from "@preact/signals";
import { TbMenu2 } from "@preact-icons/tb";
import { State } from "../utils.ts";

export default function CornerMenu({ state }: { state: State }) {
  const overlayOpen = useSignal(false);
  if (!overlayOpen.value) {
    return (
      <button
        type="button"
        class="absoluteButton hover:cursor-pointer pointer-events-auto fixed right-2 top-2 z-50"
        onClick={() => {
          overlayOpen.value = true;
        }}
      >
        <TbMenu2 class="text-slate-400" />
      </button>
    );
  }
  const loggedIn = !!state?.session;
  return (
    <div class="flex flex-row h-screen w-screen fixed left-0 top-0">
      {/* The rest of the screen when clicked will close Menu overlay */}
      <div
        class="grow h-screen"
        onClick={() => {
          overlayOpen.value = false;
        }}
      />
      <div class="w-[160px] h-screen bg-slate-900/90 text-slate-300
    text-3xl font-light p-3 flex flex-col gap-y-4">
        {loggedIn ? <p>Profile</p> : null}
        {loggedIn
          ? (
            <a class="text-red-300" href="/api/logout">
              Logout
            </a>
          )
          : <a href="/login">Login</a>}
      </div>
    </div>
  );
}
