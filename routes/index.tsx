import GroupOverview from "../islands/GroupOverview.tsx";
import { PageProps } from "$fresh/server.ts";
import { Dates } from "../utilities/dates.ts";
import { PersonalVerse } from "../components/PersonalVerse.tsx";
import { AppState } from "./_middleware.ts";

function LoginOutButton({ loggedIn }: { loggedIn: boolean }) {
  if (loggedIn) {
    return (
      <div class="loginOutButton bg-slate-700/50  text-slate-400">
        <a href="/api/logout">Logout</a>
      </div>
    );
  }
  return (
    <div class="loginOutButton bg-slate-600 text-slate-100 ">
      <a href="/login">Login</a>
    </div>
  );
}
export default function Home({ state }: PageProps<unknown, AppState>) {
  const dateTonight = Dates.getMonthDay();
  return (
    <div class="w-full h-screen min-h-full bg-slate-800 flex flex-col items-center overflow-auto">
      <LoginOutButton loggedIn={!!state.profile} />
      <PersonalVerse name={state.profile?.username} />
      <span class="text-slate-200 text-lg my-4">
        Attendance for {dateTonight}:
        <span class="font-bold text-3xl font-mono ml-2">102</span>
      </span>
      <div class="grid grid-cols-2 gap-2 sm:gap-8 gap-y-2 mb-4">
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
    </div>
  );
}
