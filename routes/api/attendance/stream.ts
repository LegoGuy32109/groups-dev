import { Attendance } from "../../../types/entities/Attendance.ts";
import { Db } from "../../../utilities/Database.ts";
import { Dates } from "../../../utilities/Dates.ts";
import { define } from "../../../utils.ts";

export const handler = define.handlers({
  async GET(ctx) {
    const encodedGroups = new URL(ctx.req.url).searchParams.get("groups");
    if (!encodedGroups) return new Response(null, { status: 402 });

    const groups: Array<string> =
      JSON.parse(decodeURIComponent(encodedGroups)) ?? [];
    const today = Dates.getMonthDay();
    const kv = await Db.kv();
    const keys = groups.map((group) => ["attendance", group, today]);

    const stream = kv.watch<Array<Attendance>>(keys).getReader();
    const body = new ReadableStream({
      async start(controller) {
        while (true) {
          if ((await stream.read()).done) {
            return;
          }
          const values = (await kv.getMany<Array<Attendance>>(keys))
            .filter((value) => !!value);
          controller.enqueue(
            new TextEncoder().encode(
              `data: ${JSON.stringify(values)}\n\n`,
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
      await Db.updateAttendance(group, delta, userId);
      return new Response(null, { status: 204 });
    }
    return new Response(null, { status: 401 });
  },
});
