import { useEffect, useState } from "preact/hooks";
import { Attendance } from "../types/entities/Attendance.ts";
import { State } from "../utils.ts";
import { Gender } from "../types/Gender.ts";
import { Grade } from "../types/Grade.ts";

const groups = Object.values(Grade).flatMap((grade) =>
  Object.values(Gender).map((gender) =>
    `${grade} ${gender === Gender.Male ? "Boys" : "Girls"}`
  )
);

export default function GroupOverview({ state }: { state: State }) {
  const dateTonight = state.today;
  const [attendance, setAttendance] = useState<Record<string, number>>({});

  useEffect(() => {
    const eventSource = new EventSource(
      `/api/attendance/stream?groups=${
        encodeURIComponent(JSON.stringify(groups))
      }`,
    );

    eventSource.onmessage = (event) => {
      const attendances: Array<Deno.KvEntry<Attendance>> = JSON.parse(
        event.data,
      );
      for (const attendance of attendances) {
        const { key, value } = attendance;
        if (key && value) {
          const group = groups.find((group) => key.includes(group));
          if (group) {
            setAttendance((prev) => ({ ...prev, [group]: value.count }));
          }
        }
      }
    };
    return () => {
      eventSource.close();
    };
  }, []);

  return (
    <>
      <div class="h-8 text-slate-200 text-lg my-4">
        Attendance for {dateTonight}:
        <span class="font-bold text-3xl font-mono ml-2">
          {Object.values(attendance).reduce((curr, acc) => curr + acc, 0)}
        </span>
      </div>
      <div class="grid grid-cols-2 gap-2 sm:gap-8 gap-y-2 mb-4 select-none">
        {groups.map((group: string) => (
          <a
            class="flex justify-between items-center flex-row py-2 px-3 shadow-lg shadow-sky-900 bg-sky-700 even:bg-pink-700 even:shadow-pink-900 rounded-full font-sans text-slate-200 cursor-pointer hover:scale-105 transition-all"
            href={`./attendance/${group}`}
          >
            <span class="font-semibold text-md sm:text-2xl whitespace-break-spaces mx-2 w-min">
              {group}
            </span>
            <span
              class={`text-3xl sm:text-6xl font-bold font-mono tabular-nums ${
                (attendance[group] ?? 0) === 0 ? "opacity-75" : ""
              }`}
            >
              {attendance[group] ?? 0}
            </span>
          </a>
        ))}
      </div>
    </>
  );
}
