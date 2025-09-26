import { Attendance } from "../types/entities/Attendance.ts";
import { Dates } from "./Dates.ts";
import { Errors } from "./Errors.ts";
import { AsyncResult } from "./security.ts";

interface DbOptions {
  test?: boolean;
  path?: string;
}

export class Db {
  private static _kv: Deno.Kv | null = null;

  /**
   * Closes current connection and created one with given options
   */
  static async configure(options: DbOptions = {}) {
    Db.close();
    Db._kv = await Deno.openKv(options.test ? ":memory:" : options.path);
  }

  /**
   * Will need to be reconfigured after close
   */
  static close() {
    if (Db._kv) Db._kv.close();
    Db._kv = null;
  }

  /**
   * Get a kv instance from Db singleton
   * Might have configuration already applied
   *
   * Note: see `Db.configure()`
   */
  static async kv(): Promise<Deno.Kv> {
    if (Db._kv) {
      return Db._kv;
    }
    // if it wasn't already configured, give default
    return await Deno.openKv();
  }

  static async getGroupmeIds() {
    const kv = await Db.kv();

    return await Array.fromAsync(
      kv.list<string>({ prefix: ["groupmeIds"] }),
    );
  }

  static async getUserIdFromGroupmeId(
    id: string,
  ): AsyncResult<{ userId: string }> {
    const kv = await Db.kv();

    const userId = (await kv.get<string>(["groupmeIds", id])).value;
    if (!userId) {
      return Errors.make(`No userId found for groupme id '${id}'`);
    }

    return { success: true, userId };
  }


  static async deleteAllDataInTable(table: string) {
    const kv = await Db.kv();
    const iter = kv.list({ prefix: [table] });
    const deletes: Promise<void>[] = [];

    for await (const entry of iter) {
      deletes.push(kv.delete(entry.key));
    }

    await Promise.all(deletes);
  }

  static async deleteAllDataInDb() {
    await Promise.all([
      this.deleteAllDataInTable("users"),
      this.deleteAllDataInTable("usernames"),
      this.deleteAllDataInTable("sessions"),
      this.deleteAllDataInTable("tokens"),
      this.deleteAllDataInTable("attendance"),
    ]);
  }

  static async updateAttendance(
    group: string,
    delta: number,
    causedBy?: string, // guid
  ): AsyncResult {
    const kv = await Db.kv();
    const today = Dates.getMonthDay();
    const now = Dates.getNowIso();

    const key = ["attendance", group, today];
    const existsValue = await kv.get<Attendance>(key);

    // first counter
    if (!existsValue.value) {
      if (delta > 0) {
        const result = await kv.atomic()
          .check({ key, versionstamp: null })
          .set(
            key,
            {
              count: delta,
              createdOn: now,
              updatedOn: now,
              createdBy: causedBy ?? "system",
              updatedBy: causedBy ?? "system",
            } satisfies Attendance,
          ).commit();
        if (!result.ok) {
          return Errors.make("Failed to create new value");
        }
      }
      return { success: true };
    }
    // counter already exists
    const other = await kv.atomic()
      .set(
        key,
        {
          ...existsValue.value,
          count: Math.max(0, existsValue.value.count + delta),
          updatedOn: now,
          updatedBy: causedBy ?? "system",
        } satisfies Attendance,
      ).commit();
    if (!other.ok) {
      return Errors.make("Failed to create new value");
    }
    return { success: true };
  }
}
