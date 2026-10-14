// DB stores UTC (timestamptz). The UI works in Sri Lanka time.
export const TZ = "Asia/Colombo";

/** "2026-10-20" + "14:30" (Sri Lanka time) -> Date */
export const parseLocal = (date: string, time: string) => new Date(`${date}T${time}:00+05:30`);

export function todayString() {
  return new Date().toLocaleDateString("en-CA", { timeZone: TZ });
}

export const colomboDayStart = () => new Date(`${todayString()}T00:00:00+05:30`);

export const formatDateTime = (d: Date) =>
  d.toLocaleString("en-GB", { timeZone: TZ, weekday: "short", day: "numeric", month: "short", hour: "numeric", minute: "2-digit", hour12: true });

export const isDateString = (s?: string): s is string => !!s && /^\d{4}-\d{2}-\d{2}$/.test(s);

export const addDays = (date: string, n: number) =>
  new Date(parseLocal(date, "12:00").getTime() + n * 86_400_000).toLocaleDateString("en-CA", { timeZone: TZ });

export const timeString = (d: Date) =>
  d.toLocaleTimeString("en-GB", { timeZone: TZ, hour: "2-digit", minute: "2-digit", hour12: false });

export const dateLabel = (date: string) =>
  parseLocal(date, "12:00").toLocaleDateString("en-GB", { timeZone: TZ, weekday: "long", day: "numeric", month: "long" });
