import { createSupabaseAdmin } from "@/lib/supabase";

export type CronRunStatus = "success" | "skipped" | "error";

export type CronRun = {
  id: string;
  name: string;
  status: CronRunStatus;
  requestId?: string;
  schedule?: string;
  startedAt: string;
  durationMs: number;
  summary: Record<string, unknown>;
  createdAt: string;
};

type CronRunRow = {
  id: string;
  name: string;
  status: CronRunStatus;
  request_id: string | null;
  schedule: string | null;
  started_at: string;
  duration_ms: number;
  summary: Record<string, unknown>;
  created_at: string;
};

function mapRun(row: CronRunRow): CronRun {
  return {
    id: row.id,
    name: row.name,
    status: row.status,
    requestId: row.request_id || undefined,
    schedule: row.schedule || undefined,
    startedAt: row.started_at,
    durationMs: row.duration_ms,
    summary: row.summary || {},
    createdAt: row.created_at,
  };
}

function isMissingRunsTable(error: { code?: string; message?: string }) {
  return error.code === "PGRST205" || error.code === "42P01" || Boolean(error.message?.includes("cron_runs"));
}

async function pruneOldCronRuns() {
  const supabase = createSupabaseAdmin();
  const cutoff = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString();
  const { error } = await supabase.from("cron_runs").delete().lt("started_at", cutoff);

  if (error && !isMissingRunsTable(error)) {
    throw new Error(`Erro ao limpar histórico antigo de cron: ${error.message}`);
  }
}

export async function recordCronRun(input: {
  name: string;
  status: CronRunStatus;
  requestId?: string;
  schedule?: string | null;
  startedAt: string;
  durationMs: number;
  summary: Record<string, unknown>;
}) {
  const supabase = createSupabaseAdmin();
  const { error } = await supabase.from("cron_runs").insert({
    name: input.name,
    status: input.status,
    request_id: input.requestId || null,
    schedule: input.schedule || null,
    started_at: input.startedAt,
    duration_ms: input.durationMs,
    summary: input.summary,
  });

  if (error && !isMissingRunsTable(error)) {
    throw new Error(`Erro ao registrar execução do cron: ${error.message}`);
  }

  await pruneOldCronRuns();
}

export async function listCronRuns(limit = 50) {
  const supabase = createSupabaseAdmin();
  const { data, error } = await supabase
    .from("cron_runs")
    .select("id,name,status,request_id,schedule,started_at,duration_ms,summary,created_at")
    .order("started_at", { ascending: false })
    .limit(limit);

  if (error) {
    if (isMissingRunsTable(error)) {
      return [];
    }

    throw new Error(`Erro ao carregar histórico de cron: ${error.message}`);
  }

  return ((data || []) as CronRunRow[]).map(mapRun);
}
