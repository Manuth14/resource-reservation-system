"use client";

import { useActionState } from "react";
import { createReservation, updateReservation, type FormState } from "@/actions/reservation.actions";

type Defaults = { id: string; title: string; date: string; start: string; end: string };
type Props = {
  resources: { id: string; name: string }[];
  selectedId?: string;
  today: string;
  defaults?: Defaults;
};

const input = "w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm disabled:bg-paper";
const label = "mb-1 block text-sm font-semibold";

export default function ReservationForm({ resources, selectedId, today, defaults }: Props) {
  const editing = !!defaults;
  const [state, action, pending] = useActionState<FormState, FormData>(editing ? updateReservation : createReservation, {});
  return (
    <form action={action} className="flex max-w-lg flex-col gap-4 rounded-2xl border border-line bg-surface p-6">
      {state.error && <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>}
      {editing && <input type="hidden" name="id" value={defaults.id} />}
      <div>
        <label htmlFor="resourceId" className={label}>Resource</label>
        <select id="resourceId" name="resourceId" required disabled={editing} defaultValue={selectedId ?? ""} className={input}>
          <option value="" disabled>Choose a resource</option>
          {resources.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
        </select>
        {editing && <p className="mt-1 text-xs text-muted">To change the resource, cancel this booking and create a new one.</p>}
      </div>
      <div>
        <label htmlFor="title" className={label}>Title</label>
        <input id="title" name="title" required maxLength={200} defaultValue={defaults?.title} placeholder="e.g. Sprint planning" className={input} />
      </div>
      <div>
        <label htmlFor="date" className={label}>Date</label>
        <input id="date" name="date" type="date" required min={today} defaultValue={defaults?.date ?? today} className={input} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="start" className={label}>Start</label>
          <input id="start" name="start" type="time" required defaultValue={defaults?.start} className={input} />
        </div>
        <div>
          <label htmlFor="end" className={label}>End</label>
          <input id="end" name="end" type="time" required defaultValue={defaults?.end} className={input} />
        </div>
      </div>
      <p className="text-xs text-muted">Times are in Sri Lanka time. Back-to-back bookings are allowed.</p>
      <button type="submit" disabled={pending} className="rounded-xl bg-brand px-4 py-2.5 text-sm font-bold text-ink transition-colors hover:bg-[#35bd80] disabled:opacity-60">
        {pending ? "Saving..." : editing ? "Save changes" : "Reserve"}
      </button>
    </form>
  );
}
