import GroupOverview from "../../islands/GroupOverview.tsx";
import { PageProps } from "$fresh/server.ts";
import { Dates } from "../../utilities/dates.ts";
import { PersonalVerse } from "../../components/PersonalVerse.tsx";
import { AppState } from "./_middleware.ts";
import { Grade } from "../../types/Grade.ts";
import { Gender } from "../../types/Gender.ts";

export default function Home({ state }: PageProps<unknown, AppState>) {
  const dateTonight = Dates.getMonthDay();
  const groups = Object.values(Grade).flatMap((grade) =>
    Object.values(Gender).map((gender) =>
      `${grade} ${gender === Gender.Male ? "Boys" : "Girls"}`
    )
  );
  return (
    <>
      <div class="h-8 text-slate-200 text-lg my-4">
        Attendance for {dateTonight}:
        <span class="font-bold text-3xl font-mono ml-2">102</span>
      </div>
      <div class="grid grid-cols-2 gap-2 sm:gap-8 gap-y-2 mb-4 select-none">
        {groups.map((group) => (
          <GroupOverview key={group} group={group} count={0} />
        ))}
      </div>
      <PersonalVerse name={state.profile?.username} />
    </>
  );
}
