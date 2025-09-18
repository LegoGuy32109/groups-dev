import CornerMenu from "../../islands/CornerMenu.tsx";
import { define } from "../../utils.ts";

export default define.page(
  function Layout({ Component, state }) {
    return (
      <div class="min-w-full min-h-screen bg-slate-800 
      flex flex-col items-center justify-center">
        <Component />
        <CornerMenu state={state} />
      </div>
    );
  },
);
