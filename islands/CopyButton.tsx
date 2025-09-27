import { TbCopy } from "@preact-icons/tb";
import { useSignal } from "@preact/signals";

export default function CopyButton({ value }: { value: string }) {
  const successOverlay = useSignal(false);

  async function onClick() {
    await navigator.clipboard.writeText(value);
    successOverlay.value = true;
    setTimeout(() => successOverlay.value = false, 2000);
  }

  return (
    <div class="relative">
      <div
        class={`
         absolute top-5 bg-gray-700 rounded-sm m-0.5 p-1 
         text-green-500 font-medium 
         opacity-0 ${successOverlay.value ? "opacity-100" : ""}
         transition-opacity 
      `}
      >
        Copied
      </div>
      <button
        type="button"
        aria-label="Copy Contents"
        onClick={onClick}
        class="cursor-pointer text-lg"
      >
        <TbCopy />
      </button>
    </div>
  );
}
