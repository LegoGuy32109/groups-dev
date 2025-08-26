export default function LoginFrom(
  { username, password }: { username?: string; password?: string },
) {
  return (
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
          value={username}
          required
          class="rounded-lg text-slate-800 font-normal selection:border-transparent"
        />
      </label>
      <label class="text-slate-300 flex justify-between gap-4">
        Password:{" "}
        <input
          type="password"
          name="password"
          value={password}
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
  );
}
