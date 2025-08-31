import { PageProps } from "$fresh/server.ts";
import { AppState } from "./_middleware.ts";
function LoginOutButton({ loggedIn }: { loggedIn: boolean }) {
  if (loggedIn) {
    return (
      <div class="loginOutButton bg-slate-700/50  text-slate-400">
        <a href="/api/logout">Logout</a>
      </div>
    );
  }
  return (
    <div class="loginOutButton bg-slate-600 text-slate-100">
      <a href="/login">Login</a>
    </div>
  );
}
export default function Layout(
  { Component, state }: PageProps<unknown, AppState>,
) {
  return (
    <div class="min-w-full min-h-screen bg-slate-800 
      flex flex-col items-center justify-center">
      <LoginOutButton loggedIn={!!state.profile} />
      <Component />
    </div>
  );
}
