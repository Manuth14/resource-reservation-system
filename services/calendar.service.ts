import { db } from "@/lib/db";
import { parseLocal } from "@/lib/datetime";
import type { Booking } from "./dashboard.service";
import { DAY_START, DAY_END } from "./dashboard.service";

/** Timetable for one day (Sri Lanka time), for all active resources or a single resource. */
export async function getDayTimetable(date: string, resourceId?: string) {
  const dayStart = parseLocal(date, "00:00");
  const dayEnd = new Date(dayStart.getTime() + 86_400_000);
  const [resources, reservations] = await Promise.all([
    db.resource.findMany({
      where: resourceId ? { id: resourceId } : { is_active: true },
      include: { type: true },
      orderBy: { name: "asc" },
    }),
    db.reservation.findMany({
      where: { status: "CONFIRMED", start_time: { lt: dayEnd }, end_time: { gt: dayStart }, ...(resourceId ? { resource_id: resourceId } : {}) },
      include: { user: true },
      orderBy: { start_time: "asc" },
    }),
  ]);
  const hr = (d: Date) => (d.getTime() - dayStart.getTime()) / 3_600_000;
  const nowH = hr(new Date());
  const rows = resources.map((r) => ({
    id: r.id,
    name: r.name,
    type: r.type.name,
    bookings: reservations
      .filter((b) => b.resource_id === r.id)
      .map((b): Booking => ({ start: Math.max(DAY_START, hr(b.start_time)), end: Math.min(DAY_END, hr(b.end_time)), title: b.title, by: b.user.name }))
      .filter((b) => b.end > b.start),
  }));
  return { rows, now: nowH >= 0 && nowH < 24 ? nowH : null };
}
