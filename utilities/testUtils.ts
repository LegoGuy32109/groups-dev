import { assertEquals } from "@std/assert";
import { Db } from "./Database.ts";

export class Test {
  /**
   * Wrapper to make kv pull from temporary database, deleted after finished
   */
  static runInTempDb(test: () => Promise<void>) {
    return async () => {
      // give us a clean slate to test
      await Db.configure({ test: true });
      await test();
      // close database at end of test
      Db.close();
    };
  }

  static guid(possibleGuid: string) {
    const parts = possibleGuid.split("-");
    assertEquals(parts.length, 5, "guid not comprised of 4 dashes '-'");
    const [p1, p2, p3, p4, p5] = parts;
    assertEquals(
      p1.length,
      8,
      `part 1 of guid not 8 characters long, got: ${p1}`,
    );
    assertEquals(
      p2.length,
      4,
      `part 2 of guid not 4 characters long, got: ${p2}`,
    );
    assertEquals(
      p3.length,
      4,
      `part 3 of guid not 4 characters long, got: ${p3}`,
    );
    assertEquals(
      p4.length,
      4,
      `part 4 of guid not 4 characters long, got: ${p4}`,
    );
    assertEquals(
      p5.length,
      12,
      `part 5 of guid not 12 characters long, got: ${p5}`,
    );
  }
}
