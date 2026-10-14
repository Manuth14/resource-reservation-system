import { requireUser } from "@/lib/auth";
import { todayString } from "@/lib/datetime";
import { listActiveResources } from "@/services/resource.service";
import ReservationForm from "@/components/reservations/ReservationForm";

export default async function NewReservationPage({ searchParams }: { searchParams: Promise<{ resourceId?: string }> }) {
  await requireUser();
  const { resourceId } = await searchParams;
  const resources = await listActiveResources();
  return (
    <div className="mx-auto max-w-6xl">
      <h1 className="mb-6 font-display text-3xl font-bold tracking-tight">New reservation</h1>
      <ReservationForm resources={resources} selectedId={resourceId} today={todayString()} />
    </div>
  );
}
