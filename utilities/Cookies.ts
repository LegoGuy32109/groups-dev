import { Cookie, deleteCookie, getCookies, setCookie } from "@std/http";

export class Cookies {
  static Error = "groups-error";
  static Auth = "groups-auth";
  static Groupme = "groups-groupme"; // groupme access token
  static Token = "groups-token"; // userId to assign to groupme account

  static clear(headers: Headers, cookieName: string | Array<string>) {
    const cookieNames = Array.isArray(cookieName) ? cookieName : [cookieName];
    for (const name of cookieNames) {
      deleteCookie(headers, name, { path: "/" });
    }
  }

  static get(
    requestOrHeaders: Request | Headers,
    cookieName: string,
  ): string | undefined {
    const cookies = getCookies(
      requestOrHeaders instanceof Request
        ? requestOrHeaders.headers
        : requestOrHeaders,
    );
    const value = cookies[cookieName];
    if (value) {
      return decodeURIComponent(value);
    }
  }

  static getErrors(
    requestOrHeaders: Request | Headers,
  ): Array<string> {
    const stringifiedErrors = Cookies.get(requestOrHeaders, Cookies.Error);
    if (!stringifiedErrors) return [];

    let errors: Array<string> = [];
    try {
      errors = JSON.parse(stringifiedErrors);
    } catch {
      errors.push(
        `Failed to parse errors in cookie, got '${stringifiedErrors}'`,
      );
    }
    return errors;
  }

  static set(
    { cookie, headers: paramHeaders }: SetCookieOptions,
  ): Headers {
    const headers = paramHeaders ?? new Headers();
    setCookie(headers, {
      sameSite: "Lax",
      httpOnly: true,
      path: "/",
      secure: true,
      ...cookie,
      value: encodeURIComponent(cookie.value),
    });
    return headers;
  }

  static setErrors(
    headers: Headers,
    errors: string | Array<string>,
  ): Headers {
    return Cookies.set({
      cookie: {
        name: Cookies.Error,
        value: JSON.stringify(Array.isArray(errors) ? errors : [errors]),
        maxAge: 20,
      },
      headers,
    });
  }
}

interface SetCookieOptions {
  cookie: Cookie;
  headers?: Headers;
}
