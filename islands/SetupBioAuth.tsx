import { TbFaceId } from "@preact-icons/tb";
import { useState } from "preact/hooks";

export default function SetupBioAuth({ userId }: { userId?: string }) {
  const [buttonState, setButtonState] = useState<
    "active" | "disabled" | "loading"
  >("active");

  async function requestChallenge() {
    const response = await fetch("/api/auth/credential");
    const { ok, createCredentialOptionsJson } = await response.json();
    if (!ok) {
      console.error("Failed to get registration options");
      return;
    }

    const credentialCreationOptions = PublicKeyCredential
      .parseCreationOptionsFromJSON(createCredentialOptionsJson);

    const credential = await globalThis.navigator.credentials.create({
      publicKey: credentialCreationOptions,
    });

    if (!credential) {
      console.error("Failed to create Credential");
      return;
    }

    // send credential to server (authenticated)
    const registerResponse = await fetch("/api/auth/credential", {
      method: "POST",
      body: JSON.stringify({
        credential,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!registerResponse.ok) {
      console.error((await registerResponse.json()).errors);
      return;
    }

    setButtonState("disabled");
  }

  async function handleLogin() {
    setButtonState("loading");
    const response = await fetch("/api/auth/credential");
    const { ok, requestCredentialOptionsJson } = await response.json();
    if (!ok) {
      console.error("Failed to get challenge");
      setButtonState("active");
      return;
    }

    const requestOptions = PublicKeyCredential.parseRequestOptionsFromJSON(
      requestCredentialOptionsJson,
    );

    if (!requestOptions) {
      console.error("Failed to parse request options");
      setButtonState("active");
      return;
    }

    console.log("asserting...", requestOptions);
    const assertion = await globalThis.navigator.credentials.get({
      publicKey: requestOptions,
      // WARN: every time I uncomment this it doesn't work, I don't know why
      // mediation: "conditional",
    });

    if (!assertion) {
      console.log("User cancelled login, or no credential was found.");
      setButtonState("active");
      return;
    }

    // send assertion to server (unauthenticated)
    const loginResponse = await fetch("/api/auth/credential", {
      method: "POST",
      body: JSON.stringify({
        assertion,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!loginResponse.ok) {
      console.error((await loginResponse.json()).errors);
      setButtonState("active");
      return;
    }

    const redirectUrl = loginResponse.redirected
      ? loginResponse.url
      : loginResponse.headers.get("location") ?? "/";
    globalThis.location.assign(redirectUrl);

    setButtonState("disabled");
  }

  return (
    <div>
      <button
        type="button"
        disabled={buttonState === "disabled" || buttonState === "loading"}
        onClick={userId ? requestChallenge : handleLogin}
        class="flex gap-4 items-center bg-slate-400 text-slate-900 rounded-md py-1 pr-3 pl-2 mt-4 font-semibold shadow-lg shadow-slate-900/90"
      >
        {buttonState === "disabled" ? "Done!" : (
          <>
            <TbFaceId class="text-4xl" />{" "}
            <>
              {buttonState === "loading"
                ? "Loading..."
                : <p>{userId ? "Setup" : "Login with"} Face / Touch ID</p>}
            </>
          </>
        )}
      </button>
    </div>
  );
}
