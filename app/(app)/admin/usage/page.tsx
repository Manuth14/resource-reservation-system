import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { getUsage } from "@/services/usage.service";

const RANGES = [7, 30, 90];

export default async function UsagePage({ searchParams }: { searchParams: Promise<{ days?: string }> }) {
  await requireAdmin();
  const { days: d } = await searchParams;
  const days = RANGES.includes(Number(d)) ? Number(d) : 30;
  const usage = await getUsage(days);

  return (
    <div className="mx-auto max-w-6xl">
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">Usage</h1>
          <p className="mt-1 text-muted">
            {usage.totalBookings} bookings and {usage.totalCancelled} cancellations in the last {days} days. Utilization assumes 8 AM to 6 PM each day.
          </p>
        </div>
        <nav className="flex gap-2" aria-label="Range">
          {RANGES.map((r) => (
            <Link key={r} href={`/admin/usage?days=${r}`} aria-current={r === days ? "page" : undefined}
              className={`rounded-lg border px-3 py-1.5 text-sm font-semibold ${r === days ? "border-brand bg-brand-tint text-brand-deep" : "border-line text-muted hover:text-ink"}`}>
              {r} days
            </Link>
          ))}
        </nav>
      </header>

      <section className="mb-8 overflow-x-auto rounded-2xl border border-line bg-surface">
        <table className="w-full min-w-160 text-left text-sm">
          <caption className="sr-only">Usage per resource</caption>
          <thead className="border-b border-line text-muted">
            <tr>
              <th className="px-5 py-3 font-semibold">Resource</th>
              <th className="px-3 py-3 font-semibold">Bookings</th>
              <th className="px-3 py-3 font-semibold">Hours</th>
              <th className="px-3 py-3 font-semibold">Cancelled</th>
              <th className="px-5 py-3 font-semibold">Utilization</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {usage.byResource.map((r) => (
              <tr key={r.name}>
                <td className="px-5 py-3"><span className="font-bold">{r.name}</span> <span className="text-muted">{r.type}{r.active ? "" : " · inactive"}</span></td>
                <td className="px-3 py-3">{r.bookings}</td>
                <td className="px-3 py-3">{r.hours.toFixed(1)}</td>
                <td className="px-3 py-3">{r.cancelled}</td>
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <div className="h-2 w-32 overflow-hidden rounded-full bg-paper"><div className="h-full bg-brand" style={{ width: `${r.utilization}%` }} /></div>
                    <span className="w-10 font-semibold">{r.utilization}%</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="max-w-lg rounded-2xl border border-line bg-surface p-6">
        <h2 className="mb-3 font-display text-lg font-semibold">Most active users</h2>
        {usage.byUser.length === 0 ? (
          <p className="text-sm text-muted">No bookings in this period.</p>
        ) : (
          <ul className="divide-y divide-line">
            {usage.byUser.map((u) => (
              <li key={u.name} className="flex justify-between py-2 text-sm">
                <span className="font-semibold">{u.name}</span>
                <span className="text-muted">{u.bookings} bookings · {u.hours.toFixed(1)} h</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
