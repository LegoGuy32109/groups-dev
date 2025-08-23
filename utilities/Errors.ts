import { assert } from "$std/assert/assert.ts";
import { Result } from "./security.ts";
export class Errors {
  /**
   * # Errors
   * On result success being false
   */
  static checkResult<T>(result: Result<T>, errorMsg?: string): T {
    const { success, ...rest } = result;
    assert(
      success,
      `${errorMsg?.concat(":\n")}${Errors.joinErrors(result)}`,
    );
    // assert throws if success is false, so we know there would be no errors there
    return rest as T;
  }
  static joinErrors<T>(result: Result<T>): string {
    if (result.success) return "";
    return result.errors.join("\n");
  }
  static make(
    errors: string | Array<string>,
  ): { success: false; errors: Array<string> } {
    return {
      success: false,
      errors: Array.isArray(errors) ? errors : [errors],
    };
  }
}
