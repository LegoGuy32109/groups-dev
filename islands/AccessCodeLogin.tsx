import { useSignal } from "@preact/signals";

export default function AccessCodeLogin() {
  const accessCode = useSignal("");
  const submitting = useSignal(false);

  function redirectWithError(message: string) {
    const encoded = encodeURIComponent(message);
    globalThis.location.assign(`/login?error=${encoded}`);
  }

  async function handleSubmit(event: Event) {
    event.preventDefault();
    if (submitting.value) return;

    const code = accessCode.value.trim();
    if (!code) {
      redirectWithError("Missing access code.");
      return;
    }

    submitting.value = true;
    let response: Response | null = null;
    try {
      response = await fetch("/api/auth/accessCode", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ accessCode: code }),
      });
    } catch (err) {
      console.error(err);
      redirectWithError("Failed to reach the server.");
      submitting.value = false;
      return;
    }

    let data: { errors?: string[]; redirect?: string } | undefined;
    try {
      data = await response.json();
    } catch {
      data = undefined;
    }

    if (!response.ok) {
      const errorMessage = data?.errors?.[0] ?? "Access code rejected.";
      redirectWithError(errorMessage);
      submitting.value = false;
      return;
    }

    const redirectTo = data?.redirect ?? "/";
    globalThis.location.assign(redirectTo);
  }

  return (
    <form onSubmit={handleSubmit}>
      <label>
        I have an access code:{" "}
        <input
          class="ml-1 mr-4 px-1 bg-slate-100 rounded-md w-20"
          name="accessCode"
          type="text"
          value={accessCode.value}
          onInput={(event) =>
            accessCode.value = (event.currentTarget as HTMLInputElement).value}
        />
      </label>
      <button
        class="bg-slate-600 rounded-full text-slate-200 font-bold px-3 py-1 text-sm"
        type="submit"
        disabled={submitting.value}
      >
        Submit
      </button>
    </form>
  );
}
