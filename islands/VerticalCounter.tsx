import { useSignal } from "@preact/signals";
import HyrdrationBoundary from "../components/HydrationBoundary.tsx";

export default function VerticalCounter(
  { count: countParam }: { count: number },
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

  const count = useSignal(countParam);

  function decrementCount() {
    if (count.value > 0) {
      count.value += -1;
    }
  }

  function incrementCount() {
    count.value += 1;
  }

  globalThis.addEventListener("touchstart", () => {}, { passive: true });

  return (
    <HyrdrationBoundary>
      <div class="flex flex-col items-center w-full grow">
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
