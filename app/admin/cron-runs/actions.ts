"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getAppUrl } from "@/lib/urls";

type CronName = "build-weekly" | "send-weekly";

function buildRedirect(params: Record<string, string>) {
  const searchParams = new URLSearchParams(params);
  redirect(`/admin/cron-runs?${searchParams.toString()}`);
}

function getMessage(payload: Record<string, unknown>) {
  if (typeof payload.reason === "string") {
    return payload.reason;
  }

  if (typeof payload.error === "string") {
    return payload.error;
  }

  if (typeof payload.sent === "number") {
    return `Enviados ${payload.sent}, falhas ${typeof payload.failed === "number" ? payload.failed : 0}`;
  }

  if (typeof payload.collected === "number") {
    return `Coletadas ${payload.collected}`;
  }

  return "Cron executado.";
}

async function getCronBaseUrl() {
  const headerStore = await headers();
  const host = headerStore.get("x-forwarded-host") || headerStore.get("host");
  const proto = headerStore.get("x-forwarded-proto") || "https";

  return host ? `${proto}://${host}` : getAppUrl();
}

async function triggerCron(name: CronName) {
  if (!(await isAdminAuthenticated())) {
    redirect("/admin");
  }

  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    buildRedirect({ trigger: name, status: "error", message: "CRON_SECRET ausente." });
  }

  const response = await fetch(`${await getCronBaseUrl()}/api/cron/${name}`, {
    method: "GET",
    headers: {
      authorization: `Bearer ${cronSecret}`,
    },
    cache: "no-store",
  });

  const payload = (await response.json().catch(() => ({}))) as Record<string, unknown>;
  revalidatePath("/admin/cron-runs");

  buildRedirect({
    trigger: name,
    status: response.ok ? "ok" : "error",
    message: getMessage(payload),
  });
}

export async function triggerBuildWeeklyAction() {
  await triggerCron("build-weekly");
}

export async function triggerSendWeeklyAction(formData: FormData) {
  const confirmed = String(formData.get("confirm")) === "yes";
  if (!confirmed) {
    buildRedirect({ trigger: "send-weekly", status: "error", message: "Confirme antes de executar o envio." });
  }

  await triggerCron("send-weekly");
}
