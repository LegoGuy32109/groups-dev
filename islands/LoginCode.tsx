import { useSignal } from "@preact/signals";
import Conditional from "../components/Conditional.tsx";
import { MdQrCode } from "@preact-icons/md";
import { qrcode } from "@libs/qrcode";
import { useEffect, useMemo } from "preact/hooks";

export default function LoginCode({ userId }: { userId?: string }) {
  const codeShown = useSignal(false);
  const qrcodeSvg = useSignal("");

  function handleShowLoginCode() {
    codeShown.value = true;

    const urlToGenerate =
      `${globalThis.location.origin}/login?token=${crypto.randomUUID()}`;
    console.log(urlToGenerate);
    const svg = qrcode(urlToGenerate, {
      output: "svg",
    });
    console.log(svg);
    qrcodeSvg.value = svg;
  }

  const url = useMemo(() => {
    const blob = new Blob([qrcodeSvg.value], { type: "image/svg+xml" });
    return URL.createObjectURL(blob);
  }, [qrcodeSvg.value]);
  useEffect(() => () => URL.revokeObjectURL(url), [url]);

  return (
    <Conditional visible={!codeShown.value}>
      <button
        type="button"
        class="bg-blue-500 bg-linear-to-br/oklab from-blue-500 to-blue-700 rounded-lg p-2 font-bold my-2"
        onClick={handleShowLoginCode}
      >
        <span class="flex flex-row gap-3">
          Show Login Code <MdQrCode class="text-2xl" />
        </span>
      </button>
      <img
        class="mx-8 my-5 max-w-[700px]"
        src={url}
        alt="Qrcode to login as user"
      />
    </Conditional>
  );
}
