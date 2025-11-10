import { TbFaceId } from "@preact-icons/tb";
import { Profile } from "../types/entities/Profile.ts";

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

export default function SetupBioAuth(
  { hostname, userId, profile }: {
    hostname: string;
    userId: string;
    profile: Profile;
  },
) {
  async function offerChallenge() {
    const encoder = new TextEncoder();
    const name = `${profile.firstName} ${profile.lastName}`;
    const publicKey: PublicKeyCredentialCreationOptions = {
      challenge: crypto.getRandomValues(new Uint8Array(32)),
      rp: {
        name: "Groups",
        id: hostname,
      },
      user: {
        id: encoder.encode(userId),
        name,
        displayName: name,
      },
      pubKeyCredParams: [
        { type: "public-key", alg: -7 }, // ES256
        { type: "public-key", alg: -257 }, // RS256 (optional)
      ],
      authenticatorSelection: {
        userVerification: "preferred", // don't require biometric verification
        residentKey: "preferred",
      },
      timeout: 60000, // this offer expires in 1 minute
      attestation: "none", // or "direct" | "indirect"
      excludeCredentials: [], // list existing credentials IDs to prevent duplicates
    };

    // request credential creation (Face/Touch ID will be invoked on device)
    let credential: Credential | undefined = undefined;
    try {
      credential = await globalThis.navigator.credentials.create({
        publicKey,
      }) ?? undefined;
    } catch (e) {
      console.log(e);
    }

    if (!credential) {
      console.error("Failed to get credential from user");
      return;
    }

    const response = await fetch("/api/auth/registerCredential", {
      method: "POST",
      body: JSON.stringify({
        credential,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });
    console.log(await response.json());
  }

  async function handleLogin() {
    const assertion = await navigator.credentials.get();
    console.log(assertion);
    // const response = await fetch("/api/auth/registerCredential", {
    //   method: "POST",
    // });
  }

  return (
    <div>
      <button
        type="button"
        onClick={offerChallenge}
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
