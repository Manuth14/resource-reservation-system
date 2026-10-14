"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { AppError } from "@/lib/errors";
import * as resources from "@/services/resource.service";
import type { FormState } from "./reservation.actions";

export async function createResource(_prev: FormState, fd: FormData): Promise<FormState> {
  await requireAdmin(); // permission is enforced on the server, not just by hiding buttons
  const cap = String(fd.get("capacity") ?? "").trim();
  try {
    await resources.createResource({
      name: String(fd.get("name") ?? "").trim(),
      typeId: String(fd.get("typeId") ?? ""),
      location: String(fd.get("location") ?? "").trim(),
      capacity: cap ? Number(cap) : null,
    });
  } catch (e) {
    if (e instanceof AppError) return { error: e.message };
    throw e;
  }
  revalidatePath("/resources");
  redirect("/resources");
}

export async function toggleResource(fd: FormData) {
  await requireAdmin();
  await resources.setResourceActive(String(fd.get("id")), fd.get("active") === "true");
  revalidatePath("/resources");
  revalidatePath("/");
}
