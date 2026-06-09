import { createSupabaseAdmin } from "@/lib/supabase";
import type { NewsletterEdition } from "@/lib/editions";
import { getClickStatsByEdition } from "@/lib/click-tracking";

export type EditionStats = {
  checked: number;
  sent: number;
  failed: number;
  skipped: number;
  unsubscribedAfterSend: number;
  durationMs?: number;
  requestId?: string;
  startedAt?: string;
  totalClicks: number;
  uniqueClickers: number;
  topItems: Array<{ itemIndex: number; clicks: number }>;
};

type CronRunRow = {
  request_id: string | null;
  started_at: string;
  duration_ms: number | null;
  summary: Record<string, unknown> | null;
};

function numberFromSummary(summary: Record<string, unknown>, key: string) {
  const value = summary[key];
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

async function getNextSentAt(edition: NewsletterEdition) {
  if (!edition.sentAt) {
    return undefined;
  }

  const supabase = createSupabaseAdmin();
  const { data, error } = await supabase
    .from("newsletter_editions")
    .select("sent_at")
    .eq("status", "sent")
    .gt("sent_at", edition.sentAt)
    .order("sent_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(`Erro ao buscar próxima edição enviada: ${error.message}`);
  }

  return typeof data?.sent_at === "string" ? data.sent_at : undefined;
}

async function countUnsubscribesInWindow(edition: NewsletterEdition) {
  if (!edition.sentAt) {
    return 0;
  }

  const supabase = createSupabaseAdmin();
  const nextSentAt = await getNextSentAt(edition);
  let query = supabase
    .from("subscriber_events")
    .select("id", { count: "exact", head: true })
    .eq("type", "unsubscribed")
    .gte("created_at", edition.sentAt);

  if (nextSentAt) {
    query = query.lt("created_at", nextSentAt);
  }

  const { count, error } = await query;

  if (error) {
    throw new Error(`Erro ao contar descadastros da edição: ${error.message}`);
  }

  return count || 0;
}

export async function getEditionStats(edition: NewsletterEdition): Promise<EditionStats | null> {
  if (!edition.sentAt) {
    return null;
  }

  const supabase = createSupabaseAdmin();
  const [{ data, error }, unsubscribedAfterSend, clickStats] = await Promise.all([
    supabase
      .from("cron_runs")
      .select("request_id,started_at,duration_ms,summary")
      .eq("name", "send-weekly")
      .order("started_at", { ascending: false })
      .limit(100),
    countUnsubscribesInWindow(edition),
    getClickStatsByEdition(edition.id),
  ]);

  if (error) {
    throw new Error(`Erro ao carregar estatísticas da edição: ${error.message}`);
  }

  const matchingRun = ((data || []) as CronRunRow[]).find((run) => run.summary?.editionId === edition.id);
  if (!matchingRun?.summary) {
    return {
      checked: 0,
      sent: 0,
      failed: 0,
      skipped: 0,
      unsubscribedAfterSend,
      totalClicks: clickStats.totalClicks,
      uniqueClickers: clickStats.uniqueClickers,
      topItems: clickStats.topItems,
    };
  }

  return {
    checked: numberFromSummary(matchingRun.summary, "checked"),
    sent: numberFromSummary(matchingRun.summary, "sent"),
    failed: numberFromSummary(matchingRun.summary, "failed"),
    skipped: numberFromSummary(matchingRun.summary, "skipped"),
    unsubscribedAfterSend,
    totalClicks: clickStats.totalClicks,
    uniqueClickers: clickStats.uniqueClickers,
    topItems: clickStats.topItems,
    durationMs: matchingRun.duration_ms || undefined,
    requestId: matchingRun.request_id || undefined,
    startedAt: matchingRun.started_at,
  };
}
