"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { SESSION_COOKIE } from "@/lib/auth";

export async function loginAs(formData: FormData) {
  const userId = String(formData.get("userId") ?? "");
  const user = await db.user.findUnique({ where: { id: userId } }).catch(() => null);
  if (!user) redirect("/login?error=invalid");

  (await cookies()).set(SESSION_COOKIE, user.id, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
    secure: process.env.NODE_ENV === "production",
  });
  redirect("/");
}

export async function logout() {
  (await cookies()).delete(SESSION_COOKIE);
  redirect("/login");
}
