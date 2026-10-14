"use client";

import { useActionState } from "react";
import { createResource } from "@/actions/resource.actions";
import type { FormState } from "@/actions/reservation.actions";

export default function ResourceForm({ types }: { types: { id: string; name: string }[] }) {
  const [state, action, pending] = useActionState<FormState, FormData>(createResource, {});
  const label = "mb-1 block text-sm font-semibold";
  return (
    <form action={action} className="flex max-w-lg flex-col gap-4 rounded-2xl border border-line bg-surface p-6">
      {state.error && <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>}
      <div>
        <label htmlFor="name" className={label}>Name</label>
        <input id="name" name="name" required maxLength={150} className="w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm" />
      </div>
      <div>
        <label htmlFor="typeId" className={label}>Type</label>
        <select id="typeId" name="typeId" required defaultValue="" className="w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm">
          <option value="" disabled>Choose a type</option>
          {types.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="location" className={label}>Location</label>
          <input id="location" name="location" maxLength={150} className="w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm" />
        </div>
        <div>
          <label htmlFor="capacity" className={label}>Capacity</label>
          <input id="capacity" name="capacity" type="number" min={1} className="w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm" />
        </div>
      </div>
      <button type="submit" disabled={pending} className="rounded-xl bg-brand px-4 py-2.5 text-sm font-bold text-ink transition-colors hover:bg-[#35bd80] disabled:opacity-60">{pending ? "Saving..." : "Add resource"}</button>
    </form>
  );
}
