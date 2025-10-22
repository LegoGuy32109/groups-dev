import { TbFaceId } from "@preact-icons/tb";
import { fromBase64, generateAuthCredential } from "../utilities/security.ts";

export default function SetupBioAuth({ userId }: { userId: string }) {
  async function handleClick() {
     generateAuthCredential(userId)
    // const credential = await globalThis.navigator.credentials.create({
    //   publicKey: {
    //      user: {
    //         id: Buffer.from(userId, "utf8").toString("base64url")
    //      },
    //     challenge,
    //     authenticatorSelection: {
    //       authenticatorAttachment: "platform",
    //       userVerification: "required",
    //     },
    //   },
    // });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      class="flex gap-4 items-center bg-slate-400 text-slate-900 rounded-md py-1 pr-3 pl-2 mt-4 font-semibold shadow-lg shadow-slate-900/90"
    >
      <TbFaceId class="text-4xl" /> Setup Face / Touch ID
    </button>
  );
}
