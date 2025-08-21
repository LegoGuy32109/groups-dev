import { useSignal } from "@preact/signals";
import { JSX } from "preact/jsx-runtime";
export default function BotTest() {
  const message = useSignal("");
  function handleInput(event: JSX.TargetedInputEvent<HTMLInputElement>) {
    message.value = event.currentTarget.value;
  }
  async function handleSubmit(event: JSX.TargetedSubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    const response = await fetch("/api/botMessage", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ botMessage: message.value }),
    });
    if (!response.ok) {
      console.error("Failed to send message:", await response.text());
      return;
    }
    console.log("Sent message succesfully, response:", await response.text());
    message.value = "";
  }
  return (
    <form onSubmit={handleSubmit}>
      <label>
        Message for bot:<input
          class="ring-black border-black bg-gray-200"
          placeholder="msg here"
          value={message}
          onInput={handleInput}
        />
      </label>
      <button type="submit" class="b">Submit</button>
    </form>
  );
}
