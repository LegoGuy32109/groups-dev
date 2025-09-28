import { useSignal } from "@preact/signals";
import Conditional from "../components/Conditional.tsx";
import { MdQrCode } from "@preact-icons/md";
import { qrcode } from "@libs/qrcode";
import { useEffect, useMemo } from "preact/hooks";
import { Profile } from "../types/entities/Profile.ts";
import { TbCodeDots } from "@preact-icons/tb";

export default function LoginCode(
  { userId, profile }: { userId?: string; profile: Profile },
) {
  const codeShown = useSignal(false);
  const qrcodeSvg = useSignal("");
  const loginLink = useSignal("");

  function handleShowLoginCode() {
    codeShown.value = true;

    // get link to user
    loginLink.value =
      `${globalThis.location.origin}/login?token=${crypto.randomUUID()}`;
    const svg = qrcode(loginLink.value, { output: "svg" });
    qrcodeSvg.value = svg;
  }

  const url = useMemo(() => {
    const blob = new Blob([qrcodeSvg.value], { type: "image/svg+xml" });
    return URL.createObjectURL(blob);
  }, [qrcodeSvg.value]);
  useEffect(() => () => URL.revokeObjectURL(url), [url]);

  return (
    <>
      <Conditional visible={!codeShown.value}>
        <button
          type="button"
          class="bg-blue-500 bg-linear-to-br/oklab from-blue-500 to-blue-700 rounded-lg p-2 font-bold my-2"
          onClick={handleShowLoginCode}
        >
          <span class="flex flex-row gap-2">
            Show Login Code <MdQrCode class="text-2xl" />
          </span>
        </button>
      </Conditional>
      <Conditional visible={codeShown.value}>
        <div class="m-4 flex flex-col ring-slate-400 ring-4 rounded-xl">
          <div class="flex flex-col items-center p-2 text-sm">
            <p>
              Hi {profile.firstName}! This is Josh the tech admin for E91Students sunday
              nights. I'm sending you this link so you can access our Attendance
              tracker 2.0 : )
            </p>
            <p class="text-red-100">
              Every link is personalized, so please don't share them.
            </p>
          </div>
          <img
            class="mx-7 mt-4 max-w-[700px]"
            src={url}
            alt="Qrcode to login as user"
          />
          <a href={loginLink.value} class="m-2 text-xs text-blue-200 underline">
            {loginLink.value}
          </a>
          <p class="italic text-center px-2 pb-2">
            Save this image to your photos, then tap on the Qr Code to access
            the link
          </p>
        </div>
      </Conditional>
    </>
  );
}
