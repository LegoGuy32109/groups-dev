import { FreshContext } from "$fresh/server.ts";

export const handler = async (
  req: Request,
  _ctx: FreshContext,
): Promise<Response> => {
  const bot_id = Deno.env.get("GROUPME_BOT_ID");
  const groupUrl = Deno.env.get("GROUPME_GROUP_URL");
  const responseBody = await req.json();
  if (!responseBody.botMessage) {
    return new Response("No `botMessage` in request", { status: 400 });
  }
  const response = await fetch("https://api.groupme.com/v3/bots/post", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text: responseBody.botMessage, bot_id }),
  });
  const text = await response.text();
  console.log(text);
  return new Response(
    `Sent message successfully, you can see it here: ${groupUrl}`,
    { status: 200 },
  );
};
