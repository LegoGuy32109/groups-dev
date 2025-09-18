import VerticalCounter from "../../../islands/VerticalCounter.tsx";
import { getGroupColor } from "../../../utilities/groupUtils.ts";
import { define } from "../../../utils.ts";

export default define.page(function Page({ params }) {
  const group = decodeURIComponent(params.group);
  const count = 0;

  //TODO: check if group exists or user has permission to log attendance for a new group

  return (
    <div class="p-6 flex flex-col items-center w-full grow">
      <a
        href="/"
        class={`text-slate-300 text-4xl mb-8 font-semibold py-2 px-5 rounded-3xl border-slate-800/50 border-[6px]`}
        style={{ backgroundColor: getGroupColor(group) }}
      >
        {group}
      </a>
      <VerticalCounter count={count} />
    </div>
  );
});
