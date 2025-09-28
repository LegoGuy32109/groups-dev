import CornerMenu from "../../islands/CornerMenu.tsx";
import { define } from "../../utils.ts";

export default define.page(
  function Layout({ Component, state }) {
    return (
      <div class="w-dvw h-dvh bg-slate-800">
        <div class="max-md:h-6" />
        <div class="relative flex flex-col items-center justify-center">
          <Component />
          <CornerMenu state={state} />
        </div>
      </div>
    );
  },
);
