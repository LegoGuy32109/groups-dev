import { PageProps } from "$fresh/server.ts";
import CornerMenu from "../../islands/CornerMenu.tsx";
import { AppState } from "./_middleware.ts";
export default function Layout(
  { Component, state }: PageProps<unknown, AppState>,
) {
  return (
    <div class="min-w-full min-h-screen bg-slate-800 
      flex flex-col items-center justify-center">
      <Component />
      <CornerMenu state={state} />
    </div>
  );
}
