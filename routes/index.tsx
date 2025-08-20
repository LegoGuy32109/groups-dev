import GroupOverview from "../islands/GroupOverview.tsx";
import { getCookies } from "$std/http/cookie.ts";
import { Handlers, PageProps } from "$fresh/server.ts";
import { Dates } from "../utilities/dates.ts";

interface Data {
  isAllowed: boolean;
}
export const handler: Handlers = {
  GET(req, ctx) {
    const cookies = getCookies(req.headers);
    return ctx.render({ isAllowed: cookies.auth === "bar" });
  },
};
function Login(
  { class: classString, visible }: { class?: string; visible?: boolean },
) {
  if (!visible) {
    return (
      <form class={classString} method="get" action="/api/logout">
        <button
          type="submit"
          class="rounded-full bg-sky-500 hover:bg-sky-400 text-slate-200 m-1 p-2 font-bold text-xs"
        >
          Logout
        </button>
      </form>
    );
  }
  return (
    <form class={classString} method="post" action="/api/login">
      <label>
        Username:{" "}
        <input type="text" name="username" autocomplete="username" required />
      </label>
      <label>
        Password:{" "}
        <input
          type="password"
          name="password"
          autocomplete="current-password"
          required
        />
      </label>
      <button
        type="submit"
        class="rounded-full bg-sky-500 hover:bg-sky-400 text-slate-200 m-1 p-2 font-bold text-xs"
      >
        Submit
      </button>
    </form>
  );
}
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
export default function Home({ data }: PageProps<Data>) {
  const dateTonight = Dates.getMonthDay();
  return (
    <div class="w-full h-screen min-h-full bg-slate-800 flex flex-col items-center overflow-auto">
      <LoginOutButton loggedIn={false} />
      <div class="mt-16 mx-2 gap-y-2 flex flex-col">
        <h1 class="text-2xl font-semibold p-1 quoteGradient">
          I will heal your broken heart,{" "}
          <span>Josh</span>, and mend all your wounds.
        </h1>
        <a
          class="text-slate-300 rounded-md bg-slate-900/60 font-extralight
         py-1 px-3 w-min whitespace-nowrap"
          href={`https://www.bible.com/bible/1713/psa.147_1.3.CSB`}
        >
          Psalm 147:3
        </a>
      </div>
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
