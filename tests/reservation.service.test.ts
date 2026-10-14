import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {db} from "@/lib/db";
import {ConflictError, ForbiddenError, ValidationError} from "@/lib/errors";
import { cancelReservation, createReservation } from "@/services/reservation.service";

const tag = `test-${Date.now()}`;
const at = (h: number, m = 0) => new Date(Date.UTC(2030, 5, 10, h, m)); // far future, UTC
let owner: { id: string; role: string };
let other: { id: string; role: string };
let admin: { id: string; role: string };
let resourceId: string;
let typeId: string;

const book = (start: Date, end: Date, actor = owner) => createReservation(actor, { resourceId, title: "Test", start, end });

beforeAll(async () => {
  const mk = (n: string, role: string) => db.user.create({ data: { name: n, email: `${tag}-${n}@test.local`, role } });
  [owner, other, admin] = await Promise.all([mk("owner", "MEMBER"), mk("other", "MEMBER"), mk("admin", "ADMIN")]);
  typeId = (await db.resourceType.create({ data: { name: tag } })).id;
  resourceId = (await db.resource.create({ data: { name: tag, type_id: typeId } })).id;
});

afterAll(async () => {
  await db.reservation.deleteMany({ where: { resource_id: resourceId } });
  await db.resource.delete({ where: { id: resourceId } });
  await db.resourceType.delete({ where: { id: typeId } });
  await db.user.deleteMany({ where: { email: { startsWith: tag } } });
  await db.$disconnect();
});

describe("createReservation", () => {
  it("rejects end time before start time", async () => {
    await expect(book(at(10), at(9))).rejects.toBeInstanceOf(ValidationError);
  });

  it("rejects bookings in the past", async () => {
    await expect(book(new Date("2020-01-01T10:00:00Z"), new Date("2020-01-01T11:00:00Z"))).rejects.toBeInstanceOf(ValidationError);
  });

  it("rejects an overlapping booking on the same resource", async () => {
    await book(at(10), at(11));
    await expect(book(at(10, 30), at(11, 30), other)).rejects.toBeInstanceOf(ConflictError);
  });

  it("allows back-to-back bookings", async () => {
    await expect(book(at(11), at(12))).resolves.toBeTruthy();
  });

  it("lets only one of two simultaneous requests win", async () => {
    const results = await Promise.allSettled([book(at(14), at(15)), book(at(14), at(15), other)]);
    expect(results.filter((r) => r.status === "fulfilled")).toHaveLength(1);
    expect(results.filter((r) => r.status === "rejected")).toHaveLength(1);
  });
});

describe("cancelReservation", () => {
  it("frees the slot for a new booking", async () => {
    const r = await book(at(16), at(17));
    await cancelReservation(owner, r.id);
    await expect(book(at(16), at(17), other)).resolves.toBeTruthy();
  });

  it("blocks a member from cancelling someone else's reservation", async () => {
    const r = await book(at(18), at(19));
    await expect(cancelReservation(other, r.id)).rejects.toBeInstanceOf(ForbiddenError);
  });

  it("lets an admin cancel any reservation", async () => {
    const r = await book(at(20), at(21));
    await expect(cancelReservation(admin, r.id)).resolves.toMatchObject({ status: "CANCELLED" });
  });
});
