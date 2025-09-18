import { useSignal } from "@preact/signals";
import { Head } from "fresh/runtime";
import { define } from "../../utils.ts";
import Counter from "../../islands/Counter.tsx";
import { Dates } from "../../utilities/Dates.ts";
import { Grade } from "../../types/Grade.ts";
import { Gender } from "../../types/Gender.ts";
import { PersonalVerse } from "../../components/PersonalVerse.tsx";
import GroupOverview from "../../islands/GroupOverview.tsx";
// function Home(ctx) {
//   const count = useSignal(3);
//
//   console.log("Shared value " + ctx.state.shared);
//
//   return (
//     <div class="px-4 py-8 mx-auto fresh-gradient min-h-screen">
//       <Head>
//         <title>Fresh counter</title>
//       </Head>
//       <div class="max-w-screen-md mx-auto flex flex-col items-center justify-center">
//         <img
//           class="my-6"
//           src="/logo.svg"
//           width="256"
//           height="256"
//           alt="the Fresh logo: a sliced lemon dripping with juice"
//         />
//         <h1 class="text-4xl font-bold">Welcome to Fresh</h1>
//         <p class="my-4">
//           Try updating this message in the
//           <code class="mx-2">./routes/index.tsx</code> file, and refresh.
//         </p>
//         <Counter count={count} />
//       </div>
//     </div>
//   );
// })
export default define.page(
  function Home({ state }) {
    // : PageProps<unknown, AppState>
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
  },
);
