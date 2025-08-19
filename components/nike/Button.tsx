export default function Button(
  { label, icon }: { label: string; icon?: string },
) {
  return (
    <button
      type="button"
      class="flex justify-center items-center gap-2 px-7 py-4 border font-light text-lg leading-none bg-red-500 text-white rounded-full border-red-500"
    >
      {label}
      <span class="size-5">{icon}</span>
    </button>
  );
}
