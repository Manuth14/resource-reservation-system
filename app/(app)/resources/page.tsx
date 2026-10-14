import Link from "next/link";
import { Plus } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { listResources } from "@/services/resource.service";
import { toggleResource } from "@/actions/resource.actions";

export default async function ResourcesPage() {
  const user = await requireUser();
  const isAdmin = user.role === "ADMIN";
  const resources = await listResources();

  return (
    <div className="mx-auto max-w-6xl">
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">Resources</h1>
          <p className="mt-1 text-muted">Rooms, equipment and vehicles that can be reserved.</p>
        </div>
        {isAdmin && (
          <Link href="/resources/new" className="inline-flex items-center gap-2 rounded-xl bg-brand px-4 py-2.5 text-sm font-bold text-ink hover:bg-[#35bd80]">
            <Plus size={18} aria-hidden /> Add resource
          </Link>
        )}
      </header>

      {resources.length === 0 ? (
        <p className="text-muted">No resources yet.{isAdmin ? " Add the first one." : ""}</p>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {resources.map((r) => (
            <li key={r.id} className={`flex flex-col rounded-2xl border border-line bg-surface p-5 ${r.is_active ? "" : "opacity-60"}`}>
              <div className="flex items-start justify-between gap-2">
                <h2 className="font-display text-lg font-semibold">{r.name}</h2>
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${r.is_active ? "bg-brand-tint text-brand-deep" : "bg-paper text-muted"}`}>
                  {r.is_active ? "Active" : "Inactive"}
                </span>
              </div>
              <p className="mt-1 text-sm text-muted">
                {r.type.name}{r.location ? ` · ${r.location}` : ""}{r.capacity ? ` · Seats ${r.capacity}` : ""}
              </p>
              <div className="mt-4 flex items-center gap-3 pt-2">
                <Link href={`/resources/${r.id}`} className="text-sm font-semibold text-muted hover:text-ink">Availability</Link>
                {r.is_active && (
                  <Link href={`/reservations/new?resourceId=${r.id}`} className="text-sm font-bold text-brand-deep hover:underline">Reserve</Link>
                )}
                {isAdmin && (
                  <form action={toggleResource} className="ml-auto">
                    <input type="hidden" name="id" value={r.id} />
                    <input type="hidden" name="active" value={String(!r.is_active)} />
                    <button type="submit" className="text-xs font-semibold text-muted hover:text-ink">
                      {r.is_active ? "Deactivate" : "Reactivate"}
                    </button>
                  </form>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
