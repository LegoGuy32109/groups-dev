import { page } from "fresh";
import VerticalCounter from "../../../islands/VerticalCounter.tsx";
import { Gender } from "../../../types/Gender.ts";
import { Grade } from "../../../types/Grade.ts";
import { getGroupColor } from "../../../utilities/groupUtils.ts";
import { define, makeRedirectResponse } from "../../../utils.ts";

export const handler = define.handlers({
  GET(ctx) {
    const groups = Object.values(Grade).flatMap((grade) =>
      Object.values(Gender).map((gender) =>
        `${grade} ${gender === Gender.Male ? "Boys" : "Girls"}`
      )
    );
    const group = decodeURIComponent(ctx.params.group);
    if (!groups.includes(group)) {
      return makeRedirectResponse(new Headers());
    }
    return page({ group });
  },
});

export default define.page(function Page({ state, data: { group } }) {
  return (
    <div class="p-6 flex flex-col items-center w-full grow">
      <a
        href="/"
        class={`text-slate-300 text-4xl mb-8 font-semibold py-2 px-5 rounded-3xl border-slate-800/50 border-[6px]`}
        style={{ backgroundColor: getGroupColor(group) }}
      >
        {group}
      </a>
      <VerticalCounter
        group={group}
        userId={state.session?.userId}
      />
    </div>
  );
});
