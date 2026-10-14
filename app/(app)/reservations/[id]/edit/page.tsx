import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { AppError } from "@/lib/errors";
import { TZ, timeString, todayString } from "@/lib/datetime";
import { getReservation } from "@/services/reservation.service";
import ReservationForm from "@/components/reservations/ReservationForm";

export default async function EditReservationPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await params;
  const r = await getReservation(user, id).catch((e) => {
    if (e instanceof AppError) return null;
    throw e;
  });
  if (!r) notFound();

  return (
    <div className="mx-auto max-w-6xl">
      <h1 className="mb-6 font-display text-3xl font-bold tracking-tight">Edit reservation</h1>
      <ReservationForm
        resources={[{ id: r.resource.id, name: r.resource.name }]}
        selectedId={r.resource_id}
        today={todayString()}
        defaults={{
          id: r.id,
          title: r.title,
          date: r.start_time.toLocaleDateString("en-CA", { timeZone: TZ }),
          start: timeString(r.start_time),
          end: timeString(r.end_time),
        }}
      />
    </div>
  );
}
