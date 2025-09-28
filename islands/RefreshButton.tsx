import { MdRefresh } from "@preact-icons/md";

export default function RefreshButton() {
  return (
    <div>
      <button
        class="rounded-lg p-3 bg-slate-700/50 text-2xl font-light text-slate-400"
        type="reset"
        aria-label="Refresh Page"
        onClick={() => globalThis.location.reload()}
      >
        <MdRefresh />
      </button>
    </div>
  );
}
