import { IconMenu2 } from "@tabler/icons-preact";
import { AppState } from "../routes/(app)/_middleware.ts";
import { useSignal } from "@preact/signals";
export default function CornerMenu({ state }: { state: AppState }) {
  const overlayOpen = useSignal(false);
  if (!overlayOpen.value) {
    return (
      <div
        class="absoluteButton fixed right-2 top-2 z-50"
        onClick={() => overlayOpen.value = true}
      >
        <IconMenu2 class="text-slate-400" />
      </div>
    );
  }
  const loggedIn = !!state?.session;
  return (
    <>
      {/* The rest of the screen when clicked will close Menu overlay */}
      <div
        class="fixed w-7/12 h-screen left-0 top-0"
        onClick={() => overlayOpen.value = false}
      />
      <div class="fixed w-5/12 h-screen bg-slate-900/90 text-slate-300 top-0 right-0
    text-3xl font-light p-3 flex flex-col gap-y-4">
        {loggedIn ? <p>Profile</p> : null}
        {loggedIn
          ? <a class="text-red-300" href="/api/logout">Logout</a>
          : <a href="/login">Login</a>}
      </div>
    </>
  );
}
