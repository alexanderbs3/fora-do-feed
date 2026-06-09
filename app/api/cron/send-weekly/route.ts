import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import WeeklyNewsletterEmail, { getWeeklyNewsletterIssue } from "@/emails/weekly";
import { getDueWeeklySubscribers, markWeeklyEmailFailed, markWeeklyEmailSent } from "@/lib/subscribers";
import { getUnsubscribeUrl } from "@/lib/urls";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function isAuthorized(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  const authorization = request.headers.get("authorization");

  return Boolean(cronSecret && authorization === `Bearer ${cronSecret}`);
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const resendApiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL || "Newsletter Técnica <onboarding@resend.dev>";

  if (!resendApiKey) {
    return NextResponse.json({ error: "Missing RESEND_API_KEY" }, { status: 500 });
  }

  const resend = new Resend(resendApiKey);
  const dueSubscribers = await getDueWeeklySubscribers();
  const errors: Array<{ email: string; week: number; message: string }> = [];
  let sent = 0;

  for (const { subscriber, dueWeek } of dueSubscribers) {
    const issue = getWeeklyNewsletterIssue(dueWeek);
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
      await markWeeklyEmailFailed(subscriber.email, dueWeek, String(error.message || "Erro desconhecido no Resend"));
      errors.push({
        email: subscriber.email,
        week: dueWeek,
        message: String(error.message || "Erro desconhecido no Resend"),
      });
      continue;
    }

    await markWeeklyEmailSent(subscriber.email, dueWeek);
    sent += 1;
  }

  return NextResponse.json({
    checked: dueSubscribers.length,
    sent,
    failed: errors.length,
    errors,
  });
}
