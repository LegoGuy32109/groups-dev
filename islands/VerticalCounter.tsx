import HyrdrationBoundary from "../components/HydrationBoundary.tsx";

export default function VerticalCounter({ count }: { count: number }) {
  const className =
    "w-full grow bg-slate-700/60 flex justify-center rounded-xl border-slate-900/80 border-[15px]";

  return (
    <HyrdrationBoundary>
      <div class="flex flex-col items-center w-full grow">
        <button
          type="button"
          class={`${className} border-b-0`}
          aria-label="Increase"
          onClick={() => console.log(1)}
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
            count === 0 ? "text-slate-300/10" : "text-slate-300/60"
          }`}
        >
          {count}
        </span>
        <button
          type="button"
          class={`${className} border-t-0`}
          aria-label="Decrease"
          // onClick={() => updateBy(-1)}
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
