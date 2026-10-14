import { db } from "@/lib/db";
import { DAY_START, DAY_END } from "./dashboard.service";

/** Usage over the last `days` days: bookings and booked hours per resource and per user. */
export async function getUsage(days: number) {
  const now = new Date();
  const since = new Date(now.getTime() - days * 86_400_000);
  const [resources, rows] = await Promise.all([
    db.resource.findMany({ include: { type: true }, orderBy: { name: "asc" } }),
    db.reservation.findMany({ where: { start_time: { gte: since, lte: now } }, include: { user: true } }),
  ]);
  const hours = (r: { start_time: Date; end_time: Date }) => (r.end_time.getTime() - r.start_time.getTime()) / 3_600_000;
  const capacity = days * (DAY_END - DAY_START);

  const byResource = resources
    .map((res) => {
      const mine = rows.filter((r) => r.resource_id === res.id);
      const confirmed = mine.filter((r) => r.status === "CONFIRMED");
      const h = confirmed.reduce((s, r) => s + hours(r), 0);
      return { name: res.name, type: res.type.name, active: res.is_active, bookings: confirmed.length, cancelled: mine.length - confirmed.length, hours: h, utilization: Math.min(100, Math.round((h / capacity) * 100)) };
    })
    .sort((a, b) => b.hours - a.hours);

  const users = new Map<string, { name: string; bookings: number; hours: number }>();
  for (const r of rows.filter((r) => r.status === "CONFIRMED")) {
    const u = users.get(r.user_id) ?? { name: r.user.name, bookings: 0, hours: 0 };
    u.bookings += 1;
    u.hours += hours(r);
    users.set(r.user_id, u);
  }
  return {
    byResource,
    byUser: [...users.values()].sort((a, b) => b.hours - a.hours),
    totalBookings: byResource.reduce((s, r) => s + r.bookings, 0),
    totalCancelled: byResource.reduce((s, r) => s + r.cancelled, 0),
  };
}
