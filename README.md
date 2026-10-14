# Resource Reservation Management System

A full-stack web application that helps an organization manage its shared resources (rooms, equipment, vehicles) and coordinate reservations, with built-in protection against double bookings.

Built for the PrimeWave Lab Software Engineering Internship technical assessment.

- **ER diagram:** `<add your shareable link>`

## The problem

Reservations were handled through informal communication and manual records, which led to scheduling confusion, overlapping reservations, and uncertainty about what is available. This application gives the organization one place to:

- keep an organized list of its resources,
- reserve them for a time slot, with overlaps made impossible,
- see at a glance what is booked and what is free,
- understand how resources are being used.

## Features

**Everyone**
- "Continue as" sign-in (demo authentication, see decisions below)
- Dashboard with today's timetable for every resource, free/in-use status, and your upcoming reservations
- Browse resources and open a resource page with a day-by-day availability timetable
- Calendar page showing all resources for any day
- Create, edit, and cancel your own reservations

**Admins (additionally)**
- Add resources, deactivate and reactivate them
- Manage resource types
- See and cancel any reservation
- Usage report: bookings, booked hours, cancellations, and utilization per resource, plus most active users

## Tech stack

| Layer     | Choice                                                            |
|-----------|-------------------------------------------------------------------|
| Framework | Next.js (App Router), React, Server Components and Server Actions |
| Language  | TypeScript                                                        |
| Database  | PostgreSQL                                                        |
| ORM       | Prisma 7 (with the `@prisma/adapter-pg` driver adapter)           |
| Styling   | Tailwind CSS v4, lucide-react icons                               |
| Tests     | Vitest (integration tests against the real database)              |

## Getting started

### Prerequisites
- Node.js 20 or newer
- PostgreSQL 14 or newer

### 1. Install dependencies
```bash
npm install
```

### 2. Create the database
Create an empty database called `resource_reservation`.

```bash
# psql
createdb resource_reservation
```
Or create it in a client such as DBeaver (`CREATE DATABASE resource_reservation;`).

### 3. Create the tables
Run the schema script. It creates the tables, indexes, and the overlap-prevention constraint:
```bash
psql -U postgres -d resource_reservation -f db/init.sql
```
In DBeaver: open `db/init.sql` in a SQL editor connected to `resource_reservation` and run it as a script (`Alt + X`).

### 4. Configure environment variables
```bash
cp .env.example .env
```
Edit `.env` and set your password:
```
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@domain:port/db_name"
```
If the password contains special characters (`@`, `#`, `/`, `:`), URL-encode them.

### 5. Generate the Prisma client and seed sample data
```bash
npx prisma generate
npx prisma db seed
```
The seed creates 3 users, 3 resource types, 5 resources, and sample reservations dated relative to today, so the dashboard has data right away. It is safe to run again.

### 6. Run the app
```bash
npm run dev
```
Open http://localhost:3000.

### Demo accounts
Authentication is simplified (see below). Pick a user on the login page:

| User          | Role   |
|---------------|--------|
| Nimal Perera  | Admin  |
| Ayesha Rahman | Member |
| Kasun Dias    | Member |

## Scripts

| Command               | Purpose                                                                                             |
|-----------------------|-----------------------------------------------------------------------------------------------------|
| `npm run dev`         | Start the development server                                                                        |
| `npm run build`       | Production build (also type-checks)                                                                 |
| `npm start`           | Run the production build                                                                            |
| `npx prisma generate` | Generate the Prisma client into `generated/prisma`                                                  |
| `npx prisma db seed`  | Load sample data                                                                                    |
| `npm test`            | Run the tests (requires a `"test": "vitest run"` script in `package.json`, or use `npx vitest run`) |

## Running the tests
```bash
npx vitest run
```
The tests run against the real database because the most important rule (no overlapping bookings) is enforced by PostgreSQL. Each run creates its own test data and removes it afterward. They cover:

- end time must be after start time, and past bookings are rejected,
- overlapping bookings on the same resource are rejected,
- back-to-back bookings are allowed,
- two simultaneous requests for the same slot: exactly one succeeds,
- cancelling frees the slot,
- a member cannot cancel someone else's reservation, an admin can.

## Database design

Four tables. See the ER diagram linked above.

```
resource_types 1 ──< resources 1 ──< reservations >── 1 users
```

| Table            | Purpose                                                                                             |
|------------------|-----------------------------------------------------------------------------------------------------|
| `users`          | People who reserve. `role` is `ADMIN` or `MEMBER`                                                   |
| `resource_types` | Categories such as Meeting Room, Equipment, Vehicle                                                 |
| `resources`      | Things that can be reserved. `is_active` allows retiring a resource without losing history          |
| `reservations`   | A user's booking of a resource for `[start_time, end_time)`. `status` is `CONFIRMED` or `CANCELLED` |

The full schema is in `db/init.sql`. `prisma/schema.prisma` mirrors it for the application.