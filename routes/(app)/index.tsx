import GroupOverview from "../../islands/GroupOverview.tsx";
import { PageProps } from "$fresh/server.ts";
import { Dates } from "../../utilities/dates.ts";
import { PersonalVerse } from "../../components/PersonalVerse.tsx";
import { AppState } from "./_middleware.ts";

export default function Home({ state }: PageProps<unknown, AppState>) {
  const dateTonight = Dates.getMonthDay();
  return (
    <>
      <div class="h-8 text-slate-200 text-lg my-4">
        Attendance for {dateTonight}:
        <span class="font-bold text-3xl font-mono ml-2">102</span>
      </div>
      <div class="grid grid-cols-2 gap-2 sm:gap-8 gap-y-2 mb-4 select-none">
        <GroupOverview group="Senior Boys" count={33} />
        <GroupOverview group="Senior Girls" count={3} />
        <GroupOverview group="Junior Boys" count={0} />
        <GroupOverview group="Junior Girls" count={10} />
        <GroupOverview group="Sophomore Boys" count={28} />
        <GroupOverview group="Sophomore Girls" count={1} />
        <GroupOverview group="Freshman Boys" count={13} />
        <GroupOverview group="Freshman Girls" count={17} />
        <GroupOverview group="JuniorHigh Boys" count={0} />
        <GroupOverview group="JuniorHigh Girls" count={0} />
      </div>
      <PersonalVerse name={state.profile?.username} />
    </>
  );
}
