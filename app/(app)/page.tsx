import Link from "next/link";
import { Plus } from "lucide-react";

import { requireUser } from "@/lib/auth";
import { TZ } from "@/lib/datetime";
import { DAY_START, DAY_END, getDashboard, type Booking } from "@/services/dashboard.service";


const span = DAY_END - DAY_START;
const pct = (h: number) => ((h - DAY_START) / span) * 100;
const fmt = (h: number) => {
  const hh = Math.floor(h);
  const mm = Math.round((h - hh) * 60);
  const suffix = hh >= 12 ? "PM" : "AM";
  return `${hh % 12 || 12}${mm ? `:${String(mm).padStart(2, "0")}` : ""} ${suffix}`;
};
const busyNow = (b: Booking[], now: number) => b.some((x) => now >= x.start && now < x.end);
const hours = Array.from({ length: span + 1 }, (_, i) => DAY_START + i);

export default async function DashboardPage() {
  const user = await requireUser();
  const { resources, stats, upcoming, now: NOW } = await getDashboard(user);
  const dateLabel = new Date().toLocaleDateString("en-GB", { timeZone: TZ, weekday: "long", day: "numeric", month: "long" });
  return (
    <div className="mx-auto max-w-6xl">
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">Hello, {user.name.split(" ")[0]}</h1>
          <p className="mt-1 text-muted">{dateLabel}. Here is what is booked today.</p>
        </div>
        <Link
          href="/reservations/new"
          className="inline-flex items-center gap-2 rounded-xl bg-brand px-4 py-2.5 text-sm font-bold text-ink transition-colors hover:bg-[#35bd80]"
        >
          <Plus size={18} aria-hidden />
          New reservation
        </Link>
      </header>

      {/* Quiet stat strip: one panel, dividers instead of four cards */}
      <dl className="mb-8 grid grid-cols-2 divide-line rounded-2xl border border-line bg-surface md:grid-cols-4 md:divide-x">
        {stats.map((s) => (
          <div key={s.label} className="px-6 py-4">
            <dt className="text-sm text-muted">{s.label}</dt>
            <dd className="mt-1 font-display text-2xl font-semibold">{s.value}</dd>
          </div>
        ))}
      </dl>

      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        {/* Today's timetable: the signature element */}
        <section className="rounded-2xl border border-line bg-surface p-6" aria-labelledby="tt">
          <div className="mb-5 flex items-baseline justify-between">
            <h2 id="tt" className="font-display text-lg font-semibold">Today's timetable</h2>
            <Link href="/calendar" className="text-sm font-semibold text-brand-deep hover:underline">
              Open full calendar
            </Link>
          </div>

          <div className="overflow-x-auto">
            <div className="min-w-[680px]">
              <div className="flex">
                <div className="w-40 shrink-0" />
                <div className="relative h-6 flex-1 text-xs text-muted">
                  {hours.map((h) => (
                    <span key={h} className="absolute -translate-x-1/2" style={{ left: `${pct(h)}%` }}>
                      {h % 12 || 12}
                    </span>
                  ))}
                </div>
              </div>

              {resources.map((r) => {
                const busy = busyNow(r.bookings, NOW);
                return (
                  <div key={r.name} className="flex items-center border-t border-line">
                    <div className="w-40 shrink-0 py-3 pr-3">
                      <p className="flex items-center gap-2 text-sm font-semibold">
                        <span
                          className={`size-2 rounded-full ${busy ? "bg-amber-500" : "bg-brand"}`}
                          aria-hidden
                        />
                        {r.name}
                      </p>
                      <p className="pl-4 text-xs text-muted">{busy ? "In use" : "Free now"}</p>
                    </div>

                    <div className="relative h-14 flex-1 bg-[linear-gradient(to_right,var(--color-line)_1px,transparent_1px)] bg-[length:10%_100%]">
                      {r.bookings.map((b) => (
                        <div
                          key={b.title}
                          title={`${b.title}, ${fmt(b.start)} to ${fmt(b.end)} (${b.by})`}
                          className="absolute top-2 bottom-2 overflow-hidden rounded-md border-l-4 border-brand bg-brand-tint px-2 py-1"
                          style={{ left: `${pct(b.start)}%`, width: `${pct(b.end) - pct(b.start)}%` }}
                        >
                          <p className="truncate text-xs font-bold text-brand-deep">{b.title}</p>
                          <p className="truncate text-[11px] text-muted">{b.by}</p>
                        </div>
                      ))}
                      <div
                        className="absolute inset-y-0 w-px bg-ink/70"
                        style={{ left: `${Math.min(100, Math.max(0, pct(NOW)))}%` }}
                        aria-hidden
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <p className="mt-4 text-xs text-muted">The dark line marks the current time ({fmt(NOW)}).</p>
        </section>

        {/* Upcoming list */}
        <section className="rounded-2xl border border-line bg-surface p-6" aria-labelledby="up">
          <h2 id="up" className="mb-4 font-display text-lg font-semibold">My upcoming</h2>
          {upcoming.length === 0 ? (
            <p className="text-sm text-muted">Nothing booked yet. Reserve a room or equipment to get started.</p>
          ) : (
            <ul className="divide-y divide-line">
              {upcoming.map((u) => (
                <li key={u.title} className="py-3 first:pt-0">
                  <p className="text-sm font-bold">{u.title}</p>
                  <p className="text-sm text-muted">{u.resource}</p>
                  <p className="mt-0.5 text-xs font-semibold text-brand-deep">{u.when}</p>
                </li>
              ))}
            </ul>
          )}
          <Link href="/reservations" className="mt-4 inline-block text-sm font-semibold text-brand-deep hover:underline">
            View all reservations
          </Link>
        </section>
      </div>
    </div>
  );
}
