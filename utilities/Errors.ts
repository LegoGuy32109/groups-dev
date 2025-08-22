import { assert } from "$std/assert/assert.ts";
import { Result } from "./security.ts";
export class Errors {
  /**
   * # Errors
   * On result success being false
   */
  static checkResult<T>(result: Result<T>, errorMsg?: string): T {
    assert(
      result.success,
      `${errorMsg?.concat(":\n")}${Errors.joinErrors(result)}`,
    );
    return result;
  }
  static joinErrors<T>(result: Result<T>): string {
    if (result.success) return "";
    return result.errors.join("\n");
  }
}
