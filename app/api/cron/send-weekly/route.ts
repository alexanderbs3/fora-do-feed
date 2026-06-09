import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import WeeklyNewsletterEmail, { getWeeklyNewsletterIssue } from "@/emails/weekly";
import { getDueWeeklySubscribers, markWeeklyEmailFailed, markWeeklyEmailSent } from "@/lib/subscribers";
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

  try {
    const resend = new Resend(resendApiKey);
    const dueSubscribers = await getDueWeeklySubscribers(startedAt);
    const errors: CronError[] = [];
    let sent = 0;
    let skipped = 0;

    logCron("info", "Due subscribers loaded", {
      requestId,
      checked: dueSubscribers.length,
    });

    for (const { subscriber, dueWeek } of dueSubscribers) {
      const issue = getWeeklyNewsletterIssue(dueWeek);
      const maskedEmail = maskEmail(subscriber.email);

      if (!issue) {
        skipped += 1;
        logCron("warn", "Weekly issue not found for due subscriber", {
          requestId,
          email: maskedEmail,
          dueWeek,
        });
        continue;
      }

      logCron("info", "Sending weekly email", {
        requestId,
        email: maskedEmail,
        week: dueWeek,
      });

      const { error } = await resend.emails.send({
        from,
        to: [subscriber.email],
        subject: issue.subject,
        react: WeeklyNewsletterEmail({
          name: subscriber.name,
          week: dueWeek,
          unsubscribeUrl: getUnsubscribeUrl(subscriber.unsubscribeToken),
        }),
      });

      if (error) {
        const message = String(error.message || "Erro desconhecido no Resend");
        errors.push({ email: maskedEmail, week: dueWeek, stage: "send", message });
        logCron("error", "Resend rejected weekly email", {
          requestId,
          email: maskedEmail,
          week: dueWeek,
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
            week: dueWeek,
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
          week: dueWeek,
        });
      } catch (markSentError) {
        const message = getErrorMessage(markSentError);
        errors.push({ email: maskedEmail, week: dueWeek, stage: "mark_sent", message });
        logCron("error", "Email was sent but could not be recorded", {
          requestId,
          email: maskedEmail,
          week: dueWeek,
          message,
        });
      }
    }

    const durationMs = Date.now() - startedAt.getTime();
    const response = {
      success: errors.length === 0,
      requestId,
      isVercelCron: auth.isVercelCron,
      schedule: auth.schedule,
      startedAt: startedAt.toISOString(),
      durationMs,
      checked: dueSubscribers.length,
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
  }
}
