import { db } from "@/lib/db";
import { colomboDayStart, formatDateTime } from "@/lib/datetime";
import type { Actor } from "./reservation.service";

export const DAY_START = 8;
export const DAY_END = 18;
export type Booking = { start: number; end: number; title: string; by: string };

export async function getDashboard(user: Actor) {
  const dayStart = colomboDayStart();
  const dayEnd = new Date(dayStart.getTime() + 86_400_000);
  const now = new Date();

  const [resources, today, mine, mineCount] = await Promise.all([
    db.resource.findMany({ where: { is_active: true }, include: { type: true }, orderBy: { name: "asc" } }),
    db.reservation.findMany({
      where: { status: "CONFIRMED", start_time: { lt: dayEnd }, end_time: { gt: dayStart } },
      include: { user: true },
      orderBy: { start_time: "asc" },
    }),
    db.reservation.findMany({
      where: { status: "CONFIRMED", user_id: user.id, end_time: { gt: now } },
      include: { resource: true },
      orderBy: { start_time: "asc" },
      take: 5,
    }),
    db.reservation.count({ where: { status: "CONFIRMED", user_id: user.id, end_time: { gt: now } } }),
  ]);

  const hr = (d: Date) => (d.getTime() - dayStart.getTime()) / 3_600_000;
  const nowH = hr(now);

  const rows = resources.map((r) => {
    const bookings: Booking[] = today
      .filter((b) => b.resource_id === r.id)
      .map((b) => ({ start: Math.max(DAY_START, hr(b.start_time)), end: Math.min(DAY_END, hr(b.end_time)), title: b.title, by: b.user.name }))
      .filter((b) => b.end > b.start);
    return { name: r.name, type: r.type.name, bookings };
  });

  const freeNow = rows.filter((r) => !r.bookings.some((b) => nowH >= b.start && nowH < b.end)).length;
  const bookedHours = rows.reduce((s, r) => s + r.bookings.reduce((a, b) => a + (b.end - b.start), 0), 0);
  const capacityHours = Math.max(1, rows.length) * (DAY_END - DAY_START);

  const stats = [
    { label: "Bookings today", value: String(today.length) },
    { label: "Resources free now", value: `${freeNow} of ${rows.length}` },
    { label: "My upcoming", value: String(mineCount) },
    user.role === "ADMIN"
      ? { label: "Utilization today", value: `${Math.round((bookedHours / capacityHours) * 100)}%` }
      : { label: "Active resources", value: String(rows.length) },
  ];

  const upcoming = mine.map((m) => ({ title: m.title, resource: m.resource.name, when: formatDateTime(m.start_time) }));
  return { resources: rows, stats, upcoming, now: nowH };
}
