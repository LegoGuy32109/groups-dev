import { ComponentChildren } from "preact";
import { useEffect, useState } from "preact/hooks";

interface HydrationBoundaryProps {
  children: ComponentChildren;
  fallback?: ComponentChildren;
  overlayClass?: string;
  fadeMs?: number;
}

export default function HyrdrationBoundary(
  {
    children,
    fallback,
    overlayClass,
    fadeMs = 100,
  }: HydrationBoundaryProps,
) {
  // when javascript is loaded on the page,
  // hydrated will be true then remove fallback / overlay
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    // smoother css transition when done on next animation frame
    const frameRequest = requestAnimationFrame(() => setHydrated(true));
    return () => {
      cancelAnimationFrame(frameRequest);
    };
  }, []);

  if (fallback && !hydrated) {
    return (
      <div inert={!hydrated} aria-busy={!hydrated}>
        {fallback}
      </div>
    );
  }

  return (
    <div
      class="relative w-full h-full grow flex"
      inert={!hydrated}
      aria-busy={!hydrated}
    >
      {children}
      <div
        aria-hidden="true"
        class={`absolute inset-0 pointer-events-none bg-black/60 backdrop-blur-md flex justify-center items-center ${overlayClass} ${
          hydrated ? "opacity-0" : "opacity-70"
        }`}
        style={{ transition: `opacity ${fadeMs}ms ease` }}
      >
          <svg
            width="240"
            height="240"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <g class="spinner_group">
              <circle
                cx="12"
                cy="12"
                r="9.5"
                pathLength="100"
                fill="none"
                stroke="#e2e8f0"
                stroke-width="4.5"
              >
              </circle>
            </g>
          </svg>
      </div>
    </div>
  );
}
