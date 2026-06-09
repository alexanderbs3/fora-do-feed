import { NextRequest, NextResponse } from "next/server";
import { acquireCronLock, releaseCronLock } from "@/lib/cron-lock";
import { recordCronRun, type CronRunStatus } from "@/lib/cron-runs";
import { buildWeeklyDraft } from "@/lib/editions";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 60;

const expectedCronSchedule = "0 11 * * 1";

function isAuthorized(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  const authorization = request.headers.get("authorization");

  return Boolean(cronSecret && authorization === `Bearer ${cronSecret}`);
}

function logBuildCron(level: "info" | "warn" | "error", message: string, metadata: Record<string, unknown> = {}) {
  console[level](
    JSON.stringify({
      scope: "weekly-draft-builder-cron",
      message,
      ...metadata,
    })
  );
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : String(error || "Erro desconhecido");
}

async function safeRecordBuildRun(input: {
  status: CronRunStatus;
  requestId: string;
  schedule: string | null;
  startedAt: string;
  durationMs: number;
  summary: Record<string, unknown>;
}) {
  try {
    await recordCronRun({ name: "build-weekly", ...input });
  } catch (error) {
    logBuildCron("error", "Build cron run history failed", { requestId: input.requestId, message: getErrorMessage(error) });
  }
}

export async function GET(request: NextRequest) {
  const startedAt = new Date();
  const requestId = request.headers.get("x-vercel-id") || crypto.randomUUID();
  const schedule = request.headers.get("x-vercel-cron-schedule");

  logBuildCron("info", "Build cron invocation received", {
    requestId,
    schedule,
    isVercelCron: Boolean(schedule),
  });

  if (!isAuthorized(request)) {
    logBuildCron("warn", "Build cron rejected", { requestId, schedule });

    return NextResponse.json({ success: false, error: "Unauthorized", requestId, schedule }, { status: 401 });
  }

  if (schedule && schedule !== expectedCronSchedule) {
    logBuildCron("warn", "Build cron rejected because schedule header does not match", {
      requestId,
      schedule,
      expectedCronSchedule,
    });

    return NextResponse.json(
      { success: false, error: "Unexpected cron schedule", requestId, schedule, expectedCronSchedule },
      { status: 400 }
    );
  }

  const lock = await acquireCronLock("build-weekly", 10 * 60 * 1000);
  if (!lock.acquired) {
    const durationMs = Date.now() - startedAt.getTime();
    const response = {
      success: true,
      requestId,
      schedule,
      startedAt: startedAt.toISOString(),
      durationMs,
      reason: "Cron already running",
      collected: 0,
      edition: null,
    };

    logBuildCron("warn", "Build cron skipped because lock is already held", response);
    await safeRecordBuildRun({
      status: "skipped",
      requestId,
      schedule,
      startedAt: startedAt.toISOString(),
      durationMs,
      summary: response,
    });
    return NextResponse.json(response);
  }

  if (lock.disabled) {
    logBuildCron("warn", "Build cron lock table is missing; running without lock", { requestId });
  }

  try {
    const result = await buildWeeklyDraft();
    const durationMs = Date.now() - startedAt.getTime();
    const response = {
      success: true,
      requestId,
      schedule,
      startedAt: startedAt.toISOString(),
      durationMs,
      collected: result.collected,
      reason: result.reason,
      edition: result.edition
        ? {
            id: result.edition.id,
            title: result.edition.title,
            slug: result.edition.slug,
            status: result.edition.status,
            items: result.edition.items.length,
          }
        : null,
    };

    logBuildCron("info", "Build cron finished", response);
    await safeRecordBuildRun({
      status: result.collected > 0 ? "success" : "skipped",
      requestId,
      schedule,
      startedAt: startedAt.toISOString(),
      durationMs,
      summary: response,
    });
    return NextResponse.json(response);
  } catch (error) {
    const durationMs = Date.now() - startedAt.getTime();
    const message = getErrorMessage(error);

    logBuildCron("error", "Build cron failed", { requestId, durationMs, message });
    await safeRecordBuildRun({
      status: "error",
      requestId,
      schedule,
      startedAt: startedAt.toISOString(),
      durationMs,
      summary: { success: false, error: message },
    });

    return NextResponse.json(
      { success: false, error: message, requestId, schedule, startedAt: startedAt.toISOString(), durationMs },
      { status: 500 }
    );
  } finally {
    try {
      await releaseCronLock(lock);
    } catch (releaseError) {
      logBuildCron("error", "Build cron lock release failed", { requestId, message: getErrorMessage(releaseError) });
    }
  }
}
