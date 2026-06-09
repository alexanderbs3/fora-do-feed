import { NextRequest, NextResponse } from "next/server";
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
    return NextResponse.json(response);
  } catch (error) {
    const durationMs = Date.now() - startedAt.getTime();
    const message = getErrorMessage(error);

    logBuildCron("error", "Build cron failed", { requestId, durationMs, message });

    return NextResponse.json(
      { success: false, error: message, requestId, schedule, startedAt: startedAt.toISOString(), durationMs },
      { status: 500 }
    );
  }
}
