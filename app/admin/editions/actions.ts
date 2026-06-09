"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Resend } from "resend";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { approveEdition, buildWeeklyDraft, getEditionById, renderEditionHtml, updateDraftEdition } from "@/lib/editions";
import { getUnsubscribeUrl } from "@/lib/urls";

function getStringList(formData: FormData, key: string) {
  return formData.getAll(key).map((value) => String(value || ""));
}

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
  const confirmed = String(formData.get("confirm") || "") === "yes";
  if (!id) {
    throw new Error("Edição inválida.");
  }

  if (!confirmed) {
    redirect(`/admin/editions/${id}?error=confirm`);
  }

  await approveEdition(id);
  revalidatePath("/admin/editions");
  revalidatePath(`/admin/editions/${id}`);
  redirect(`/admin/editions/${id}`);
}

export async function saveDraftEditionAction(formData: FormData) {
  if (!(await isAdminAuthenticated())) {
    redirect("/admin");
  }

  const id = String(formData.get("id") || "");
  const title = String(formData.get("title") || "").trim();
  const intro = String(formData.get("intro") || "").trim();
  const titles = getStringList(formData, "itemTitle");
  const urls = getStringList(formData, "itemUrl");
  const sources = getStringList(formData, "itemSource");
  const summaries = getStringList(formData, "itemSummary");
  const scores = getStringList(formData, "itemScore");
  const removeIndexes = new Set(getStringList(formData, "removeItem"));

  if (!id || !title || !intro) {
    throw new Error("Título e introdução são obrigatórios.");
  }

  const items = titles
    .map((itemTitle, index) => ({
      title: itemTitle.trim(),
      url: (urls[index] || "").trim(),
      source: (sources[index] || "").trim(),
      summary: (summaries[index] || "").trim(),
      score: Number(scores[index] || 0),
      index,
    }))
    .filter((item) => !removeIndexes.has(String(item.index)))
    .filter((item) => item.title && item.url && item.source && item.summary)
    .map(({ index: _index, ...item }) => item);

  if (items.length === 0) {
    throw new Error("A edição precisa ter pelo menos um item.");
  }

  await updateDraftEdition({ id, title, intro, items });
  revalidatePath("/admin/editions");
  revalidatePath(`/admin/editions/${id}`);
  redirect(`/admin/editions/${id}?saved=1`);
}

export async function sendEditionTestAction(formData: FormData) {
  if (!(await isAdminAuthenticated())) {
    redirect("/admin");
  }

  const id = String(formData.get("id") || "");
  const email = String(formData.get("email") || "").toLowerCase().trim();
  const resendApiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL || "Newsletter Técnica <onboarding@resend.dev>";

  if (!id || !email.includes("@")) {
    throw new Error("Informe um e-mail de teste válido.");
  }

  if (!resendApiKey) {
    throw new Error("RESEND_API_KEY ausente.");
  }

  const edition = await getEditionById(id);
  if (!edition) {
    throw new Error("Edição não encontrada.");
  }

  const resend = new Resend(resendApiKey);
  const { error } = await resend.emails.send({
    from,
    to: [email],
    subject: `[Teste] ${edition.title}`,
    html: renderEditionHtml(edition, getUnsubscribeUrl("preview")),
  });

  if (error) {
    throw new Error(`Erro ao enviar teste: ${error.message}`);
  }

  redirect(`/admin/editions/${id}?test=sent`);
}
