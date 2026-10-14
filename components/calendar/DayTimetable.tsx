import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { addDays, dateLabel, todayString } from "@/lib/datetime";
import { DAY_START, DAY_END, type Booking } from "@/services/dashboard.service";

type Row = { id: string; name: string; type: string; bookings: Booking[] };
type Props = { rows: Row[]; now: number | null; date: string; basePath: string; linkNames?: boolean };

const span = DAY_END - DAY_START;
const pct = (h: number) => ((h - DAY_START) / span) * 100;
const fmt = (h: number) => {
  const hh = Math.floor(h), mm = Math.round((h - hh) * 60);
  return `${hh % 12 || 12}${mm ? `:${String(mm).padStart(2, "0")}` : ""} ${hh >= 12 ? "PM" : "AM"}`;
};
const hours = Array.from({ length: span + 1 }, (_, i) => DAY_START + i);

export default function DayTimetable({ rows, now, date, basePath, linkNames }: Props) {
  const nav = "grid size-9 place-items-center rounded-lg border border-line hover:bg-paper";
  return (
    <section className="rounded-2xl border border-line bg-surface p-6" aria-label="Timetable">
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <Link href={`${basePath}?date=${addDays(date, -1)}`} aria-label="Previous day" className={nav}><ChevronLeft size={18} aria-hidden /></Link>
        <h2 className="font-display text-lg font-semibold">{dateLabel(date)}</h2>
        <Link href={`${basePath}?date=${addDays(date, 1)}`} aria-label="Next day" className={nav}><ChevronRight size={18} aria-hidden /></Link>
        {date !== todayString() && <Link href={basePath} className="text-sm font-semibold text-brand-deep hover:underline">Today</Link>}
      </div>

      {rows.length === 0 ? (
        <p className="text-sm text-muted">No resources to show.</p>
      ) : (
        <div className="overflow-x-auto">
          <div className="min-w-[680px]">
            <div className="flex">
              <div className="w-40 shrink-0" />
              <div className="relative h-6 flex-1 text-xs text-muted">
                {hours.map((h) => (
                  <span key={h} className="absolute -translate-x-1/2" style={{ left: `${pct(h)}%` }}>{h % 12 || 12}</span>
                ))}
              </div>
            </div>
            {rows.map((r) => (
              <div key={r.id} className="flex items-center border-t border-line">
                <div className="w-40 shrink-0 py-3 pr-3">
                  {linkNames ? <Link href={`/resources/${r.id}`} className="text-sm font-semibold hover:underline">{r.name}</Link> : <p className="text-sm font-semibold">{r.name}</p>}
                  <p className="text-xs text-muted">{r.type}</p>
                </div>
                <div className="relative h-14 flex-1 bg-[linear-gradient(to_right,var(--color-line)_1px,transparent_1px)] bg-size-[10%_100%]">
                  {r.bookings.map((b, i) => (
                    <div key={i} title={`${b.title}, ${fmt(b.start)} to ${fmt(b.end)} (${b.by})`}
                      className="absolute top-2 bottom-2 overflow-hidden rounded-md border-l-4 border-brand bg-brand-tint px-2 py-1"
                      style={{ left: `${pct(b.start)}%`, width: `${pct(b.end) - pct(b.start)}%` }}>
                      <p className="truncate text-xs font-bold text-brand-deep">{b.title}</p>
                      <p className="truncate text-[11px] text-muted">{b.by}</p>
                    </div>
                  ))}
                  {now !== null && now >= DAY_START && now <= DAY_END && (
                    <div className="absolute inset-y-0 w-px bg-ink/70" style={{ left: `${pct(now)}%` }} aria-hidden />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      <p className="mt-4 text-xs text-muted">Shaded bars are booked. Empty space is free to reserve.</p>
    </section>
  );
}
