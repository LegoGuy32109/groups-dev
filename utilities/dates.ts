export class Dates {
  static getNowIso(): string {
    return new Date(Date.now()).toISOString();
  }
}
