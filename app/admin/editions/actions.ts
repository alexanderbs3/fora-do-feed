"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { approveEdition, buildWeeklyDraft } from "@/lib/editions";

export async function buildDraftAction() {
  if (!(await isAdminAuthenticated())) {
    redirect("/admin");
  }

  await buildWeeklyDraft();
  revalidatePath("/admin/editions");
  redirect("/admin/editions?status=draft");
}

export async function approveEditionAction(formData: FormData) {
  if (!(await isAdminAuthenticated())) {
    redirect("/admin");
  }

  const id = String(formData.get("id") || "");
  if (!id) {
    throw new Error("Edição inválida.");
  }

  await approveEdition(id);
  revalidatePath("/admin/editions");
  revalidatePath(`/admin/editions/${id}`);
  redirect(`/admin/editions/${id}`);
}
