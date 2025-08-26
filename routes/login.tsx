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
    <>
      <h1 class="font-semibold text-3xl text-slate-600 leading-relaxed tracking-wider">Login to e91Students</h1>
      <form
        method="post"
        action="/api/login"
        class="flex flex-col bg-slate-600 rounded-md gap-2 p-5 font-semibold shadow-lg shadow-slate-900/90"
      >
        <label class="text-slate-300 flex justify-between gap-4">
          Username:{" "}
          <input
            type="text"
            name="username"
            autocomplete="username"
            required
            class="rounded-lg text-slate-800 font-normal selection:border-transparent"
          />
        </label>
        <label class="text-slate-300 flex justify-between gap-4">
          Password:{" "}
          <input
            type="password"
            name="password"
            autocomplete="current-password"
            required
            class="rounded-lg text-slate-800 font-normal"
          />
        </label>
        <div class="flex justify-between items-center">
          <a href="/" class="underline text-slate-800">
            Forgot Password?
          </a>
          <button
            type="submit"
            class="rounded-full text-slate-200 m-1 p-2 min-w-20
          bg-gradient-to-r from-sky-600 to-sky-300 bg-[length:150%_150%] transition-[background-position] duration-300 hover:bg-[position:90%_90%]"
          >
            Submit
          </button>
        </div>
      </form>
    </>
  );
}
