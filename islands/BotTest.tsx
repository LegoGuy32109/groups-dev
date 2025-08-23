import { useSignal } from "@preact/signals";
import { Handlers } from "$fresh/server.ts";
import { JSX } from "preact/jsx-runtime";
import { UserAgent } from "$std/http/mod.ts";
export const handler: Handlers = {
  GET(req, ctx) {
    const uaString = req.headers.get("user-agent");
    const userAgent = new UserAgent(uaString);
    console.log(userAgent);
    return ctx.render();
  },
};
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
