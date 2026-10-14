import "dotenv/config";
import { PrismaClient } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const db = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

/** Build a Date for "N days from today at HH:MM" in Sri Lanka time (UTC+05:30). */
function slot(dayOffset: number, hour: number, minute = 0) {
  const base = new Date(Date.now() + dayOffset * 86_400_000);
  const day = base.toLocaleDateString("en-CA", { timeZone: "Asia/Colombo" }); // YYYY-MM-DD
  const hh = String(hour).padStart(2, "0");
  const mm = String(minute).padStart(2, "0");
  return new Date(`${day}T${hh}:${mm}:00+05:30`);
}

async function main() {
  // ---- Users (safe to re-run: upsert by email) ----
  const userData = [
    { name: "Nimal Perera", email: "nimal@example.com", role: "ADMIN" },
    { name: "Ayesha Rahman", email: "ayesha@example.com", role: "MEMBER" },
    { name: "Kasun Dias", email: "kasun@example.com", role: "MEMBER" },
  ];
  const users: Record<string, string> = {};
  for (const u of userData) {
    const row = await db.user.upsert({ where: { email: u.email }, update: {}, create: u });
    users[u.email] = row.id;
  }

  // ---- Resource types (upsert by unique name) ----
  const types: Record<string, string> = {};
  for (const name of ["Meeting Room", "Equipment", "Vehicle"]) {
    const row = await db.resourceType.upsert({ where: { name }, update: {}, create: { name } });
    types[name] = row.id;
  }

  // ---- Resources (name is not unique, so check first) ----
  const resourceData = [
    { name: "Boardroom", type: "Meeting Room", location: "Floor 2", capacity: 12 },
    { name: "Training Hall", type: "Meeting Room", location: "Ground floor", capacity: 30 },
    { name: "Huddle Room", type: "Meeting Room", location: "Floor 1", capacity: 4 },
    { name: "Projector A", type: "Equipment", location: "IT store", capacity: null },
    { name: "Company Van", type: "Vehicle", location: "Basement parking", capacity: 8 },
  ];
  const resources: Record<string, string> = {};
  for (const r of resourceData) {
    const existing = await db.resource.findFirst({ where: { name: r.name } });
    const row =
      existing ??
      (await db.resource.create({
        data: { name: r.name, type_id: types[r.type], location: r.location, capacity: r.capacity },
      }));
    resources[r.name] = row.id;
  }

  // ---- Reservations (reset so re-running never creates duplicates) ----
  await db.reservation.deleteMany();

  const nimal = users["nimal@example.com"];
  const ayesha = users["ayesha@example.com"];
  const kasun = users["kasun@example.com"];

  await db.reservation.createMany({
    data: [
      { resource_id: resources["Boardroom"], user_id: nimal, title: "Sprint planning", start_time: slot(0, 9), end_time: slot(0, 10, 30) },
      { resource_id: resources["Boardroom"], user_id: ayesha, title: "Client review", start_time: slot(0, 13), end_time: slot(0, 15) },
      { resource_id: resources["Training Hall"], user_id: kasun, title: "Onboarding workshop", start_time: slot(0, 11), end_time: slot(0, 13) },
      { resource_id: resources["Projector A"], user_id: ayesha, title: "Demo prep", start_time: slot(0, 10), end_time: slot(0, 11) },
      // back-to-back with the one above: allowed, because ranges are [start, end)
      { resource_id: resources["Projector A"], user_id: nimal, title: "Team offsite", start_time: slot(0, 11), end_time: slot(0, 12, 30) },
      { resource_id: resources["Company Van"], user_id: kasun, title: "Site visit", start_time: slot(2, 9), end_time: slot(2, 17) },
      { resource_id: resources["Huddle Room"], user_id: ayesha, title: "1:1 catch-up", start_time: slot(1, 14), end_time: slot(1, 15) },
      // cancelled booking overlapping a confirmed one: allowed, cancelled rows don't block the slot
      {
        resource_id: resources["Boardroom"], user_id: kasun, title: "Cancelled planning session",
        start_time: slot(0, 9), end_time: slot(0, 10), status: "CANCELLED", cancelled_at: new Date(),
      },
    ],
  });

  console.log("Seeded: 3 users, 3 resource types, 5 resources, 8 reservations");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
