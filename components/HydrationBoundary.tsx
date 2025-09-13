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
      <div class="relative" inert={!hydrated} aria-busy={!hydrated}>
        {fallback}
      </div>
    );
  }

  return (
    <div class="relative w-full h-full" inert={!hydrated} aria-busy={hydrated}>
      {children}
      <div
        aria-hidden="true"
        class={`absolute inset-0 pointer-events-none bg-black/60 backdrop-blur-md flex justify-center items-center ${overlayClass} ${
          hydrated ? "opacity-0" : "opacity-70"
        }`}
        style={{ transition: `opacity ${fadeMs}ms ease` }}
      >
        <svg
          width="150"
          height="150"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            class="fill-white"
            style={{
              transformOrigin: "center",
              animation: "spinner_y6GP 0.75s linear infinite",
            }}
            d="M12,23a9.63,9.63,0,0,1-8-9.5,9.51,9.51,0,0,1,6.79-9.1A1.66,1.66,0,0,0,12,2.81h0a1.67,1.67,0,0,0-1.94-1.64A11,11,0,0,0,12,23Z"
          />
        </svg>
      </div>
    </div>
  );
}
