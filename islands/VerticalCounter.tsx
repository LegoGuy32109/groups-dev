import { useSignal } from "@preact/signals";
import HyrdrationBoundary from "../components/HydrationBoundary.tsx";
import { useEffect } from "preact/hooks";
import { Attendance } from "../types/entities/Attendance.ts";

export default function VerticalCounter(
  { group, userId }: {
    group: string;
    userId?: string;
  },
) {
  const className = `
     w-full 
     max-w-[700px]
     grow 
     flex 
     justify-center 
     items-center 
     rounded-xl 
     border-slate-900 
     border-[15px]
     text-base
     touch-manipulation
     transition transform bg-slate-700 duration-75 ease-[cubic-bezier(.2,.1,.9,1)]
     active:bg-slate-500
     active:scale-95
     focus:outline-none
  `;

  const count = useSignal(0);

  useEffect(() => {
    const eventSource = new EventSource(
      `/api/attendance/stream?groups=${
        encodeURIComponent(JSON.stringify([group]))
      }`,
    );

    eventSource.onmessage = (event) => {
      const attendances: Array<Deno.KvEntry<Attendance>> = JSON.parse(
        event.data,
      );
      for (const attendance of attendances) {
        count.value = attendance.value?.count ?? 0;
      }
    };
    return () => eventSource.close();
  }, []);

  function decrementCount() {
    if (count.value > 0) {
      fetch("/api/attendance/stream", {
        method: "POST",
        body: JSON.stringify({
          delta: -1,
          userId,
          group,
        }),
      });
    }
  }

  function incrementCount() {
    fetch("/api/attendance/stream", {
      method: "POST",
      body: JSON.stringify({
        delta: 1,
        userId,
        group,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  // INFO: this activates the active property of buttons on ios so animations look nice
  globalThis.addEventListener("touchstart", () => {}, { passive: true });

  return (
    <HyrdrationBoundary>
      <div class="flex flex-col items-center w-full grow touch-none">
        <button
          type="button"
          class={`${className} border-b-0
             `}
          aria-label="Increase"
          onClick={incrementCount}
        >
          <svg
            viewBox="0 0 24 24"
            class="fill-slate-900"
            width={150}
            height={150}
            aria-hidden="true"
          >
            <path d="M12 6l-8 8h16z" />
          </svg>
        </button>
        <span
          class={`relative tabular-nums leading-none text-8xl font-mono ${
            count.value === 0 ? "text-slate-300/10" : "text-slate-300/60"
          }`}
        >
          {count}
        </span>
        <button
          type="button"
          class={`${className} border-t-0`}
          aria-label="Decrease"
          onClick={decrementCount}
        >
          <svg
            viewBox="0 0 24 24"
            class="fill-slate-900"
            width={150}
            height={150}
            aria-hidden="true"
          >
            <path d="M12 18l8-8H4z" />
          </svg>
        </button>
      </div>
    </HyrdrationBoundary>
  );
}
