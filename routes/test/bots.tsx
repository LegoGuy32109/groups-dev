import BotTest from "../../islands/BotTest.tsx";
import { Handlers } from "$fresh/server.ts";
import { UserAgent } from "$std/http/mod.ts";
export const handler: Handlers = {
  async GET(req, ctx) {
    console.log(ctx.remoteAddr);
    const testIp = "5.161.237.247";
    const res = await fetch(
      `http://ip-api.com/json/${testIp}`,
    );
    if (res.ok) {
      const data = await res.json();
      console.log(data);
    }
    const uaString = req.headers.get("user-agent");
    const userAgent = new UserAgent(uaString);
    console.log(userAgent);
    return ctx.render();
  },
};
export default function Page() {
  return (
    <div>
      <BotTest />
    </div>
  );
}
