import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatDateTime, isDateString, todayString } from "@/lib/datetime";
import { getResource } from "@/services/resource.service";
import { getDayTimetable } from "@/services/calendar.service";
import DayTimetable from "@/components/calendar/DayTimetable";

export default async function ResourcePage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ date?: string }> }) {
  await requireUser();
  const { id } = await params;
  const resource = await getResource(id);
  if (!resource) notFound();

  const { date: d } = await searchParams;
  const date = isDateString(d) ? d : todayString();
  const [{ rows, now }, upcoming] = await Promise.all([
    getDayTimetable(date, id),
    db.reservation.findMany({
      where: { resource_id: id, status: "CONFIRMED", end_time: { gt: new Date() } },
      include: { user: true },
      orderBy: { start_time: "asc" },
      take: 10,
    }),
  ]);

  return (
    <div className="mx-auto max-w-6xl">
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">{resource.name}</h1>
          <p className="mt-1 text-muted">
            {resource.type.name}{resource.location ? ` · ${resource.location}` : ""}{resource.capacity ? ` · Seats ${resource.capacity}` : ""}
            {!resource.is_active && " · Inactive"}
          </p>
        </div>
        {resource.is_active && (
          <Link href={`/reservations/new?resourceId=${id}`} className="rounded-xl bg-brand px-4 py-2.5 text-sm font-bold text-ink hover:bg-[#35bd80]">Reserve</Link>
        )}
      </header>

      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        <DayTimetable rows={rows} now={now} date={date} basePath={`/resources/${id}`} />
        <section className="rounded-2xl border border-line bg-surface p-6">
          <h2 className="mb-4 font-display text-lg font-semibold">Upcoming bookings</h2>
          {upcoming.length === 0 ? (
            <p className="text-sm text-muted">Nothing booked. This resource is wide open.</p>
          ) : (
            <ul className="divide-y divide-line">
              {upcoming.map((u) => (
                <li key={u.id} className="py-3 first:pt-0">
                  <p className="text-sm font-bold">{u.title}</p>
                  <p className="text-sm text-muted">{u.user.name}</p>
                  <p className="mt-0.5 text-xs font-semibold text-brand-deep">{formatDateTime(u.start_time)}</p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
