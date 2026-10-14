import { db } from "@/lib/db";
import { ConflictError, ForbiddenError, NotFoundError, ValidationError } from "@/lib/errors";

export type Actor = { id: string; role: string };

function serialize(e: unknown) {
  try { return JSON.stringify(e, Object.getOwnPropertyNames(e as object)); } catch { return ""; }
}
function isOverlapError(e: unknown) {
  return /23P01|no_overlapping_reservations|exclusion constraint/i.test(`${(e as Error)?.message} ${serialize(e)}`);
}

export async function createReservation(
  actor: Actor,
  input: { resourceId: string; title: string; start: Date; end: Date },
) {
  const { resourceId, title, start, end } = input;
  if (!title) throw new ValidationError("Please enter a title.");
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) throw new ValidationError("Please choose a valid date and time.");
  if (end <= start) throw new ValidationError("End time must be after the start time.");
  if (start.getTime() < Date.now() - 60_000) throw new ValidationError("You cannot book a time in the past.");

  const resource = await db.resource.findUnique({ where: { id: resourceId } }).catch(() => null);
  if (!resource) throw new NotFoundError("Resource not found.");
  if (!resource.is_active) throw new ValidationError("This resource is currently unavailable.");

  try {
    return await db.reservation.create({
      data: { resource_id: resourceId, user_id: actor.id, title, start_time: start, end_time: end },
    });
  } catch (e) {
    // The database is the source of truth: two people booking at once cannot both succeed.
    if (isOverlapError(e)) throw new ConflictError("That time slot is already booked for this resource. Please pick another time.");
    throw e;
  }
}

export async function cancelReservation(actor: Actor, id: string) {
  const r = await db.reservation.findUnique({ where: { id } }).catch(() => null);
  if (!r) throw new NotFoundError("Reservation not found.");
  if (r.user_id !== actor.id && actor.role !== "ADMIN") throw new ForbiddenError("You can only cancel your own reservations.");
  if (r.status === "CANCELLED") return r;
  return db.reservation.update({ where: { id }, data: { status: "CANCELLED", cancelled_at: new Date() } });
}

export function listReservations(actor: Actor) {
  return db.reservation.findMany({
    where: actor.role === "ADMIN" ? {} : { user_id: actor.id },
    include: { resource: true, user: true },
    orderBy: { start_time: "desc" },
    take: 100,
  });
}

export async function getReservation(actor: Actor, id: string) {
  const r = await db.reservation.findUnique({ where: { id }, include: { resource: true } }).catch(() => null);
  if (!r) throw new NotFoundError("Reservation not found.");
  if (r.user_id !== actor.id && actor.role !== "ADMIN") throw new ForbiddenError("You can only edit your own reservations.");
  return r;
}

export async function updateReservation(actor: Actor, id: string, input: { title: string; start: Date; end: Date }) {
  const r = await getReservation(actor, id);
  const { title, start, end } = input;
  if (r.status === "CANCELLED") throw new ValidationError("Cancelled reservations cannot be edited.");
  if (r.end_time.getTime() < Date.now()) throw new ValidationError("Past reservations cannot be edited.");
  if (!title) throw new ValidationError("Please enter a title.");
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) throw new ValidationError("Please choose a valid date and time.");
  if (end <= start) throw new ValidationError("End time must be after the start time.");
  if (start.getTime() < Date.now() - 60_000) throw new ValidationError("You cannot move a booking into the past.");
  try {
    return await db.reservation.update({ where: { id }, data: { title, start_time: start, end_time: end } });
  } catch (e) {
    if (isOverlapError(e)) throw new ConflictError("That time slot is already booked for this resource. Please pick another time.");
    throw e;
  }
}
