"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { parseLocal } from "@/lib/datetime";
import { AppError } from "@/lib/errors";
import * as reservations from "@/services/reservation.service";

export type FormState = { error?: string };

export async function createReservation(_prev: FormState, fd: FormData): Promise<FormState> {
  const user = await requireUser();
  const date = String(fd.get("date") ?? "");
  try {
    await reservations.createReservation(user, {
      resourceId: String(fd.get("resourceId") ?? ""),
      title: String(fd.get("title") ?? "").trim(),
      start: parseLocal(date, String(fd.get("start") ?? "")),
      end: parseLocal(date, String(fd.get("end") ?? "")),
    });
  } catch (e) {
    if (e instanceof AppError) return { error: e.message };
    throw e;
  }
  revalidatePath("/");
  revalidatePath("/reservations");
  redirect("/reservations");
}

export async function cancelReservation(fd: FormData) {
  const user = await requireUser();
  await reservations.cancelReservation(user, String(fd.get("id") ?? ""));
  revalidatePath("/");
  revalidatePath("/reservations");
}

export async function updateReservation(_prev: FormState, fd: FormData): Promise<FormState> {
  const user = await requireUser();
  const date = String(fd.get("date") ?? "");
  try {
    await reservations.updateReservation(user, String(fd.get("id") ?? ""), {
      title: String(fd.get("title") ?? "").trim(),
      start: parseLocal(date, String(fd.get("start") ?? "")),
      end: parseLocal(date, String(fd.get("end") ?? "")),
    });
  } catch (e) {
    if (e instanceof AppError) return { error: e.message };
    throw e;
  }
  revalidatePath("/");
  revalidatePath("/reservations");
  redirect("/reservations");
}
