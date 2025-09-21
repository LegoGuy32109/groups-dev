import { Attendance } from "../../../types/entities/Attendance.ts";
import { Db } from "../../../utilities/Database.ts";
import { Dates } from "../../../utilities/Dates.ts";
import { define } from "../../../utils.ts";

export const handler = define.handlers({
  async GET(ctx) {
    const encodedGroup = new URL(ctx.req.url).searchParams.get("group");
    if (!encodedGroup) return new Response(null, { status: 402 });

    const group = decodeURIComponent(encodedGroup);
    const today = Dates.getMonthDay();
    const kv = await Db.kv();
    const key = ["attendance", group, today];

    const stream = kv.watch<Array<Attendance>>([key]).getReader();
    const body = new ReadableStream({
      async start(controller) {
        while (true) {
          if ((await stream.read()).done) {
            return;
          }
          const value = (await kv.get<Attendance>(key)).value;
          controller.enqueue(
            new TextEncoder().encode(
              `data: ${JSON.stringify(value ?? "")}\n\n`,
            ),
          );
        }
      },
      cancel() {
        stream.cancel();
      },
    });

    return new Response(body, {
      headers: {
        "content-type": "text/event-stream",
        // "cache-control": "no-cache",
      },
    });
  },

  async POST(ctx) {
    const requestData = await ctx.req.json();
    const { group, userId, delta } = requestData;
    if (group && userId && Number.isInteger(delta)) {
      console.log(requestData);
      await Db.updateAttendance(group, delta, userId);
      return new Response(null, { status: 204 });
    }
    return new Response(null, { status: 401 });
  },
});
