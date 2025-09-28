export class Dates {
  static getNowIso(): string {
    return new Date(Date.now()).toISOString();
  }
  static getDateKey(): string {
    const now = new Date();
    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone: "Etc/GMT+4",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
    const [
      { value: monthString },
      _,
      { value: dayString },
      __,
      { value: yearString },
    ] = formatter.formatToParts(now);

    return `${yearString}-${monthString}-${dayString}`;
  }
  static getDateParts(): { year: number; month: number; day: number } {
    const [year, month, day] = Dates.getDateKey().split("-").map(
      (value) => parseInt(value, 10),
    );
    return { year, month, day };
  }
  static getMonthDay(): string {
    const { month, day } = Dates.getDateParts();
    return `${month}/${day}`;
  }
  static formatIso(isoString: string): string {
    const date = new Date(isoString);
    return date.toLocaleString(undefined, { timeZone: "Etc/GMT+4" });
  }
  static fromGroupmeTemporal(temporal: GroupmeTemporal): Date {
    return new Date(temporal * 1000);
  }
}

export type GroupmeTemporal = number;
