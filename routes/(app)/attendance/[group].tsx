import { PageProps } from "$fresh/server.ts";
import VerticalCounter from "../../../islands/VerticalCounter.tsx";
import { getGroupColor } from "../../../utilities/GroupUtilites.ts";

export default function Page({ params }: PageProps) {
  const group = decodeURIComponent(params.group);
  const count = 0;

  return (
    <div class="p-6 flex flex-col items-center w-full grow">
      <h1
        class={`text-slate-300 text-4xl mb-8 font-semibold py-2 px-5 rounded-3xl border-slate-800/50 border-[6px]`}
        style={{ backgroundColor: getGroupColor(group) }}
      >
        {group}
      </h1>
      <VerticalCounter count={count} />
    </div>
  );
}
