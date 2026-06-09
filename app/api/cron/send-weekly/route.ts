import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { acquireCronLock, releaseCronLock } from "@/lib/cron-lock";
import { getLatestApprovedEdition, markEditionSent, renderEditionHtml } from "@/lib/editions";
import { getSubscribers, markWeeklyEmailFailed, markWeeklyEmailSent } from "@/lib/subscribers";
import { getUnsubscribeUrl } from "@/lib/urls";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 60;

const expectedCronSchedule = "0 12 * * *";

type CronError = {
  email: string;
  week: number;
  stage: "send" | "mark_sent" | "mark_failed";
  message: string;
};

type CronAuthResult = {
  authorized: boolean;
  hasCronSecret: boolean;
  hasAuthorizationHeader: boolean;
  schedule: string | null;
  isVercelCron: boolean;
};

function getCronAuth(request: NextRequest): CronAuthResult {
  const cronSecret = process.env.CRON_SECRET;
  const authorization = request.headers.get("authorization");
  const schedule = request.headers.get("x-vercel-cron-schedule");

  return {
    authorized: Boolean(cronSecret && authorization === `Bearer ${cronSecret}`),
    hasCronSecret: Boolean(cronSecret),
    hasAuthorizationHeader: Boolean(authorization),
    schedule,
    isVercelCron: Boolean(schedule),
  };
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : String(error || "Erro desconhecido");
}

function maskEmail(email: string) {
  const [name = "", domain = ""] = email.split("@");
  const visibleName = name.slice(0, 2);

  return domain ? `${visibleName}***@${domain}` : "***";
}

function logCron(level: "info" | "warn" | "error", message: string, metadata: Record<string, unknown> = {}) {
  const payload = {
    scope: "weekly-newsletter-cron",
    message,
    ...metadata,
  };

  console[level](JSON.stringify(payload));
}

export async function GET(request: NextRequest) {
  const startedAt = new Date();
  const auth = getCronAuth(request);
  const requestId = request.headers.get("x-vercel-id") || crypto.randomUUID();

  logCron("info", "Cron invocation received", {
    requestId,
    isVercelCron: auth.isVercelCron,
    schedule: auth.schedule,
    hasCronSecret: auth.hasCronSecret,
    hasAuthorizationHeader: auth.hasAuthorizationHeader,
  });

  if (!auth.authorized) {
    logCron("warn", "Cron invocation rejected", {
      requestId,
      isVercelCron: auth.isVercelCron,
      schedule: auth.schedule,
      hasCronSecret: auth.hasCronSecret,
      hasAuthorizationHeader: auth.hasAuthorizationHeader,
    });

    return NextResponse.json(
      {
        success: false,
        error: "Unauthorized",
        requestId,
        isVercelCron: auth.isVercelCron,
        schedule: auth.schedule,
      },
      { status: 401 }
    );
  }

  if (auth.schedule && auth.schedule !== expectedCronSchedule) {
    logCron("warn", "Cron invocation rejected because schedule header does not match", {
      requestId,
      schedule: auth.schedule,
      expectedCronSchedule,
    });

    return NextResponse.json(
      {
        success: false,
        error: "Unexpected cron schedule",
        requestId,
        schedule: auth.schedule,
        expectedCronSchedule,
      },
      { status: 400 }
    );
  }

  const resendApiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL || "Newsletter Técnica <onboarding@resend.dev>";

  if (!resendApiKey) {
    logCron("error", "Missing RESEND_API_KEY", { requestId });

    return NextResponse.json(
      {
        success: false,
        error: "Missing RESEND_API_KEY",
        requestId,
      },
      { status: 500 }
    );
  }

  const lock = await acquireCronLock("send-weekly", 10 * 60 * 1000);
  if (!lock.acquired) {
    const durationMs = Date.now() - startedAt.getTime();
    const response = {
      success: true,
      requestId,
      isVercelCron: auth.isVercelCron,
      schedule: auth.schedule,
      startedAt: startedAt.toISOString(),
      durationMs,
      reason: "Cron already running",
      checked: 0,
      sent: 0,
      skipped: 0,
      failed: 0,
      errors: [] as CronError[],
    };

    logCron("warn", "Send cron skipped because lock is already held", response);
    return NextResponse.json(response);
  }

  if (lock.disabled) {
    logCron("warn", "Send cron lock table is missing; running without lock", { requestId });
  }

  try {
    const edition = await getLatestApprovedEdition();

    if (!edition) {
      const durationMs = Date.now() - startedAt.getTime();
      const response = {
        success: true,
        requestId,
        isVercelCron: auth.isVercelCron,
        schedule: auth.schedule,
        startedAt: startedAt.toISOString(),
        durationMs,
        reason: "No approved edition available",
        checked: 0,
        sent: 0,
        skipped: 0,
        failed: 0,
        errors: [] as CronError[],
      };

      logCron("info", "Cron finished without sending because there is no approved edition", response);
      return NextResponse.json(response);
    }

    const resend = new Resend(resendApiKey);
    const activeSubscribers = (await getSubscribers()).filter((subscriber) => subscriber.status === "active");
    const errors: CronError[] = [];
    let sent = 0;
    let skipped = 0;

    logCron("info", "Approved edition and active subscribers loaded", {
      requestId,
      editionId: edition.id,
      editionTitle: edition.title,
      checked: activeSubscribers.length,
    });

    for (const subscriber of activeSubscribers) {
      const dueWeek = edition.items.length;
      const maskedEmail = maskEmail(subscriber.email);

      if (edition.items.length === 0) {
        skipped += 1;
        logCron("warn", "Approved edition has no items", {
          requestId,
          editionId: edition.id,
        });
        break;
      }

      logCron("info", "Sending weekly email", {
        requestId,
        email: maskedEmail,
        editionId: edition.id,
      });

      const { error } = await resend.emails.send({
        from,
        to: [subscriber.email],
        subject: edition.title,
        html: renderEditionHtml(edition, getUnsubscribeUrl(subscriber.unsubscribeToken)),
      });

      if (error) {
        const message = String(error.message || "Erro desconhecido no Resend");
        errors.push({ email: maskedEmail, week: dueWeek, stage: "send", message });
        logCron("error", "Resend rejected weekly email", {
          requestId,
          email: maskedEmail,
          editionId: edition.id,
          message,
        });

        try {
          await markWeeklyEmailFailed(subscriber.email, dueWeek, message);
        } catch (markFailedError) {
          const markFailedMessage = getErrorMessage(markFailedError);
          errors.push({ email: maskedEmail, week: dueWeek, stage: "mark_failed", message: markFailedMessage });
          logCron("error", "Failed to record weekly email failure", {
            requestId,
            email: maskedEmail,
            editionId: edition.id,
            message: markFailedMessage,
          });
        }

        continue;
      }

      try {
        await markWeeklyEmailSent(subscriber.email, dueWeek);
        sent += 1;
        logCron("info", "Weekly email sent and recorded", {
          requestId,
          email: maskedEmail,
          editionId: edition.id,
        });
      } catch (markSentError) {
        const message = getErrorMessage(markSentError);
        errors.push({ email: maskedEmail, week: dueWeek, stage: "mark_sent", message });
        logCron("error", "Email was sent but could not be recorded", {
          requestId,
          email: maskedEmail,
          editionId: edition.id,
          message,
        });
      }
    }

    if (sent > 0 || activeSubscribers.length === 0) {
      await markEditionSent(edition.id);
    }

    const durationMs = Date.now() - startedAt.getTime();
    const response = {
      success: errors.length === 0,
      requestId,
      editionId: edition.id,
      editionTitle: edition.title,
      isVercelCron: auth.isVercelCron,
      schedule: auth.schedule,
      startedAt: startedAt.toISOString(),
      durationMs,
      checked: activeSubscribers.length,
      sent,
      skipped,
      failed: errors.length,
      errors,
    };

    logCron(errors.length === 0 ? "info" : "warn", "Cron invocation finished", response);

    return NextResponse.json(response, { status: errors.length === 0 ? 200 : 207 });
  } catch (error) {
    const message = getErrorMessage(error);
    const durationMs = Date.now() - startedAt.getTime();

    logCron("error", "Cron invocation failed", {
      requestId,
      durationMs,
      message,
    });

    return NextResponse.json(
      {
        success: false,
        error: message,
        requestId,
        isVercelCron: auth.isVercelCron,
        schedule: auth.schedule,
        startedAt: startedAt.toISOString(),
        durationMs,
      },
      { status: 500 }
    );
  } finally {
    try {
      await releaseCronLock(lock);
    } catch (releaseError) {
      logCron("error", "Send cron lock release failed", { requestId, message: getErrorMessage(releaseError) });
    }
  }
}
