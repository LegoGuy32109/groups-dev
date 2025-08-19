import GroupOverview from "../islands/GroupOverview.tsx";

export default function Home() {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const dateTonight = now.toISOString().split("T")[0].substring(5).replaceAll(
    "-",
    "/",
  );
  return (
    <div class="w-full h-screen bg-sky-950">
      <div class="max-w-screen-md mx-auto flex flex-col items-center justify-center">
        <span class="text-slate-200 text-lg my-4">
          Attendance for {dateTonight}:{" "}
          <span class="font-bold text-3xl">102</span>
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
