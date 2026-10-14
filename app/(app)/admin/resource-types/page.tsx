import { requireAdmin } from "@/lib/auth";
import { listTypesWithCounts } from "@/services/resource.service";
import { addResourceType, deleteResourceType } from "@/actions/resource-type.actions";

export default async function ResourceTypesPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  await requireAdmin();
  const { error } = await searchParams;
  const types = await listTypesWithCounts();

  return (
    <div className="mx-auto max-w-6xl">
      <h1 className="font-display text-3xl font-bold tracking-tight">Resource types</h1>
      <p className="mt-1 mb-8 text-muted">Categories used to group resources.</p>

      {error && <p role="alert" className="mb-4 max-w-lg rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

      <form action={addResourceType} className="mb-8 flex max-w-lg gap-3">
        <label htmlFor="name" className="sr-only">New type name</label>
        <input id="name" name="name" required maxLength={100} placeholder="e.g. Meeting Room"
          className="w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm" />
        <button type="submit" className="rounded-xl bg-brand px-4 py-2 text-sm font-bold text-ink hover:bg-[#35bd80]">Add</button>
      </form>

      <ul className="max-w-lg divide-y divide-line rounded-2xl border border-line bg-surface">
        {types.map((t) => (
          <li key={t.id} className="flex items-center gap-4 px-5 py-3">
            <span className="flex-1 font-semibold">{t.name}</span>
            <span className="text-sm text-muted">{t._count.resources} resources</span>
            <form action={deleteResourceType}>
              <input type="hidden" name="id" value={t.id} />
              <button type="submit" className="text-sm font-semibold text-red-700 hover:underline">Delete</button>
            </form>
          </li>
        ))}
      </ul>
    </div>
  );
}
