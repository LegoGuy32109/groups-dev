import { assert } from "@std/assert";

export type AsyncResult<T = undefined, F = string> = Promise<Result<T, F>>;
export type Result<T = undefined, F = string> = T extends undefined
  ? { ok: true } | Fail<F>
  : T & { ok: true } | Fail<F>;

export type Fail<F = string> = { ok: false; errors: ErrorList<F> };
export type ErrorList<F> = Array<
  string | { message: string; data?: unknown; field?: string; type?: F }
>;

export class Errors {
  /**
   * # Errors
   * On result ok being false
   */
  static checkResult<T>(result: Result<T>, errorMsg?: string): T {
    const { ok, ...rest } = result;
    assert(
      ok,
      `${errorMsg?.concat(":\n")}${Errors.joinErrors(result)}`,
    );
    // assert throws if ok is false, so we know there would be no errors there
    return rest as T;
  }

  static joinErrors<T>(result: Result<T>): string {
    if (result.ok) return "";
    return result.errors.join("\n");
  }

  static make(
    errors: string | Array<string>,
  ): { ok: false; errors: Array<string> } {
    return {
      ok: false,
      errors: Array.isArray(errors) ? errors : [errors],
    };
  }
}
