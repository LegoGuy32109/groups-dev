import { Head } from "fresh/runtime";
import { define } from "../../utils.ts";
import { Dates } from "../../utilities/Dates.ts";
import { Grade } from "../../types/Grade.ts";
import { Gender } from "../../types/Gender.ts";
import { PersonalVerse } from "../../components/PersonalVerse.tsx";
import GroupOverview from "../../islands/GroupOverview.tsx";

export default define.page(
  function Home({ state }) {
    const dateTonight = Dates.getMonthDay();
    const groups = Object.values(Grade).flatMap((grade) =>
      Object.values(Gender).map((gender) =>
        `${grade} ${gender === Gender.Male ? "Boys" : "Girls"}`
      )
    );
    return (
      <>
        <Head>
          <title>E91Students - Home</title>
        </Head>
        <PersonalVerse name={state.profile?.username} />
        <div class="h-8 text-slate-200 text-lg my-4">
          Attendance for {dateTonight}:
          <span class="font-bold text-3xl font-mono ml-2">102</span>
        </div>
        <div class="grid grid-cols-2 gap-2 sm:gap-8 gap-y-2 mb-4 select-none">
          {groups.map((group) => (
            <GroupOverview key={group} group={group} count={0} />
          ))}
        </div>
      </>
    );
  },
);
