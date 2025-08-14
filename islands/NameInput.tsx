import { useSignal } from "@preact/signals";
import { JSX } from "preact/jsx-runtime";
export default function NameInput() {
  const name = useSignal("");
  const inputHandler = (event: JSX.TargetedInputEvent<HTMLInputElement>) => {
    name.value = event.currentTarget.value;
  };
  const onSubmit = (event: JSX.TargetedSubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    globalThis.location.href = `./greet/${name}`;
  };
  return (
    <form onSubmit={onSubmit}>
      <input
        type="text"
        value={name}
        onChange={inputHandler}
        class="border p-1"
      />
      <button type="submit" class="ml-1 px-2 py-1 bg-gray-100 border">
        Answer
      </button>
    </form>
  );
}
