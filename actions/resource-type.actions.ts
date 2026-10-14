"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { AppError } from "@/lib/errors";
import * as resources from "@/services/resource.service";

async function run(fn: () => Promise<unknown>) {
  await requireAdmin();
  let error = "";
  try {
    await fn();
  } catch (e) {
    if (!(e instanceof AppError)) throw e;
    error = e.message;
  }
  revalidatePath("/admin/resource-types");
  redirect(error ? `/admin/resource-types?error=${encodeURIComponent(error)}` : "/admin/resource-types");
}

export const addResourceType = async (fd: FormData) => run(() => resources.addType(String(fd.get("name") ?? "").trim()));
export const deleteResourceType = async (fd: FormData) => run(() => resources.deleteType(String(fd.get("id") ?? "")));
