import { useSignal } from "@preact/signals";
import { TbMenu2 } from "@preact-icons/tb";
import { State } from "../utils.ts";
import HyrdrationBoundary from "../components/HydrationBoundary.tsx";
import Conditional from "../components/Conditional.tsx";

export default function CornerMenu({ state }: { state: State }) {
  const overlayOpen = useSignal(false);
  if (!overlayOpen.value) {
    return (
      <div class="fixed right-2 top-2 z-50">
        <HyrdrationBoundary overlayClass="rounded-lg">
          <button
            type="button"
            class="rounded-lg p-3 bg-slate-700/50 text-2xl font-light text-slate-400 hover:cursor-pointer pointer-events-auto"
            onClick={() => {
              overlayOpen.value = true;
            }}
          >
            <TbMenu2 class="text-slate-400" />
          </button>
        </HyrdrationBoundary>
      </div>
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
        <a href="/">Home</a>
        <Conditional visible={!loggedIn}>
          <a href="/login">Login</a>
        </Conditional>
        <Conditional visible={loggedIn}>
          <a href="/profiles">
            Profiles
          </a>
        </Conditional>
        <div class="grow" />
        <Conditional visible={loggedIn}>
          <a class="text-red-300 mb-2" href="/api/logout">
            Logout
          </a>
        </Conditional>
      </div>
    </div>
  );
}
