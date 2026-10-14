import Link from "next/link";
import { Plus } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { formatDateTime } from "@/lib/datetime";
import { listReservations } from "@/services/reservation.service";
import { cancelReservation } from "@/actions/reservation.actions";

export default async function ReservationsPage() {
  const user = await requireUser();
  const isAdmin = user.role === "ADMIN";
  const rows = await listReservations(user);
  const now = Date.now();

  return (
    <div className="mx-auto max-w-6xl">
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">Reservations</h1>
          <p className="mt-1 text-muted">{isAdmin ? "All reservations in the organization." : "Your reservations."}</p>
        </div>
        <Link href="/reservations/new" className="inline-flex items-center gap-2 rounded-xl bg-brand px-4 py-2.5 text-sm font-bold text-ink hover:bg-[#35bd80]">
          <Plus size={18} aria-hidden /> New reservation
        </Link>
      </header>

      {rows.length === 0 ? (
        <p className="text-muted">No reservations yet.</p>
      ) : (
        <ul className="divide-y divide-line rounded-2xl border bg-surface">
          {rows.map((r) => {
            const cancelled = r.status === "CANCELLED";
            const canCancel = !cancelled && r.end_time.getTime() > now;
            return (
              <li key={r.id} className="flex flex-wrap items-center gap-x-6 gap-y-2 px-5 py-4">
                <div className="min-w-0 flex-1">
                  <p className={`font-bold ${cancelled ? "text-muted line-through" : ""}`}>{r.title}</p>
                  <p className="text-sm text-muted">
                    {r.resource.name} · {formatDateTime(r.start_time)} to {formatDateTime(r.end_time).split(", ").pop()}
                    {isAdmin ? ` · ${r.user.name}` : ""}
                  </p>
                </div>
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${cancelled ? "bg-paper text-muted" : "bg-brand-tint text-brand-deep"}`}>
                  {cancelled ? "Cancelled" : "Confirmed"}
                </span>
                {canCancel && (
                  <Link href={`/reservations/${r.id}/edit`} className="text-sm font-semibold text-brand-deep hover:underline">Edit</Link>
                )}
                {canCancel && (
                  <form action={cancelReservation}>
                    <input type="hidden" name="id" value={r.id} />
                    <button type="submit" className="text-sm font-semibold text-red-700 hover:underline">Cancel</button>
                  </form>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
