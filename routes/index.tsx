import GroupOverview from "../islands/GroupOverview.tsx";
import { getCookies } from "$std/http/cookie.ts";
import { Handlers, PageProps } from "$fresh/server.ts";

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
      <input type="text" name="username" />
      <input type="password" name="password" />
      <button
        type="submit"
        class="rounded-full bg-sky-500 hover:bg-sky-400 text-slate-200 m-1 p-2 font-bold text-xs"
      >
        Submit
      </button>
    </form>
  );
}
export default function Home({ data }: PageProps<Data>) {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const dateTonight = now.toISOString().split("T")[0].substring(5).replaceAll(
    "-",
    "/",
  );
  return (
    <div class="w-full h-screen bg-sky-950">
      <div class="max-w-screen-md mx-auto flex flex-col items-center justify-center">
        <div class="text-slate-200">
          You currently {data.isAllowed ? "are" : "are not"} logged in.
          <Login visible={!data.isAllowed} class="text-zinc-500" />
        </div>
        <span class="text-slate-200 text-lg my-4">
          Attendance for {dateTonight}:{" "}
          <span class="font-bold text-3xl font-mono ml-2">102</span>
        </span>
        <div class="grid grid-cols-2 gap-2 sm:gap-8 gap-y-2">
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
    </div>
  );
}
