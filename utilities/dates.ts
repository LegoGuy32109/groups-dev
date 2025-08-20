export class Dates {
  static getNowIso(): string {
    return new Date(Date.now()).toISOString();
  }
  static getMonthDay(): string {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    return now.toISOString()
      .split("T")[0]
      .substring(5)
      .replaceAll("-", "/");
  }
}
