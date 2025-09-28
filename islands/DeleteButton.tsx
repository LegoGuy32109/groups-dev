import { TbTrash } from "@preact-icons/tb";

export default function DeleteButton() {
  return (
    <button
      type="button"
      class="bg-red-800 rounded-md text-lg p-1 w-7 h-7"
      aria-label="Delete"
    >
      <TbTrash />
    </button>
  );
}
