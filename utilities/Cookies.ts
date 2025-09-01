import { Cookie, deleteCookie, getCookies, setCookie } from "$std/http/mod.ts";
export class Cookies {
  static Error = "e91-students-error";
  static Auth = "e91-students-auth";
  static clear(headers: Headers, cookieName: string) {
    deleteCookie(headers, cookieName, { path: "/" });
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
}
interface SetCookieOptions {
  cookie: Cookie;
  headers?: Headers;
}
