import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";

export const SESSION_COOKIE = "user_id";
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Returns the logged-in user, or null. Cached per request. */
export const getCurrentUser = cache(async () => {
  const id = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!id || !UUID.test(id)) return null; // ignore tampered values
  return db.user.findUnique({ where: { id } });
});

/** Use in Server Actions / pages that need a logged-in user. */
export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

/** Use in admin-only actions. Permission check happens on the server. */
export async function requireAdmin() {
  const user = await requireUser();
  if (user.role !== "ADMIN") throw new Error("Forbidden: admin access required");
  return user;
}
