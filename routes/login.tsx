export default function LoginPage() {
  return (
    <div class="w-full h-screen min-h-full bg-slate-800 flex flex-col items-center overflow-auto">
      <Login />
    </div>
  );
}
function Logout() {
  return (
    <form method="get" action="/api/logout">
      <button
        type="submit"
        class="rounded-full bg-sky-500 hover:bg-sky-400 text-slate-200 m-1 p-2 font-bold text-xs"
      >
        Logout
      </button>
    </form>
  );
}
function Login() {
  return (
    <form method="post" action="/api/login">
      <label>
        Username:{" "}
        <input type="text" name="username" autocomplete="username" required />
      </label>
      <label>
        Password:{" "}
        <input
          type="password"
          name="password"
          autocomplete="current-password"
          required
        />
      </label>
      <button
        type="submit"
        class="rounded-full bg-sky-500 hover:bg-sky-400 text-slate-200 m-1 p-2 font-bold text-xs"
      >
        Submit
      </button>
    </form>
  );
}
