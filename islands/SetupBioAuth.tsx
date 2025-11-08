import { TbFaceId } from "@preact-icons/tb";

function base64urlToUint8Array(base64url: string): Uint8Array {
  let base64 = base64url.replaceAll("-", "+").replaceAll("_", "/");
  const pad = base64.length % 4;
  if (pad === 2) base64 += "==";
  else if (pad === 3) base64 += "=";
  else if (pad !== 0) {
    throw new Error("Invalid base64url string.");
  }

  const binary = atob(base64);

  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

export default function SetupBioAuth({ userId }: { userId: string }) {
  async function handleClick() {
    const response = await fetch("/api/auth/registerCredential", {
      method: "POST",
    });
    const { publicKey, errors } = await response.json();
    if (errors) {
      console.error(errors);
      return;
    }

    // convert base64url to ArrayBuffer for binary parameters
    publicKey.challenge = base64urlToUint8Array(publicKey.challenge).buffer;
    publicKey.user.id = base64urlToUint8Array(publicKey.user.id).buffer;

    // request credential creation (Face/Touch ID will be invoked on device)
    const credential = await globalThis.navigator.credentials.create({
      publicKey,
    });
    console.log(credential);
  }

  async function handleLogin() {
    const response = await fetch("/api/auth/registerCredential", {
      method: "POST",
    });
    const { publicKey, errors } = await response.json();
    if (errors) {
      console.error(errors);
      return;
    }

    // convert base64url to ArrayBuffer for binary parameters
    publicKey.challenge = base64urlToUint8Array(publicKey.challenge).buffer;
    publicKey.user.id = base64urlToUint8Array(publicKey.user.id).buffer;

    const assertion = await navigator.credentials.get({ publicKey });
    console.log(assertion);
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleClick}
        class="flex gap-4 items-center bg-slate-400 text-slate-900 rounded-md py-1 pr-3 pl-2 mt-4 font-semibold shadow-lg shadow-slate-900/90"
      >
        <TbFaceId class="text-4xl" /> Setup Face / Touch ID
      </button>
      <button
        type="button"
        onClick={handleLogin}
        class="flex gap-4 items-center bg-slate-400 text-slate-900 rounded-md py-1 pr-3 pl-2 mt-4 font-semibold shadow-lg shadow-slate-900/90"
      >
        <TbFaceId class="text-4xl" /> Login
      </button>
    </div>
  );
}
