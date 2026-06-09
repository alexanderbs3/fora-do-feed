import { render } from "@react-email/render";
import WeeklyNewsletterEmail from "@/emails/weekly/WeeklyNewsletterEmail";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getUnsubscribeUrl } from "@/lib/urls";

type PreviewRouteProps = {
  params: Promise<{ week: string }>;
};

export async function GET(_request: Request, { params }: PreviewRouteProps) {
  if (!(await isAdminAuthenticated())) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { week } = await params;
  const parsedWeek = Number(week);
  const html = await render(
    WeeklyNewsletterEmail({
      name: "Alexander",
      week: Number.isFinite(parsedWeek) ? parsedWeek : 1,
      unsubscribeUrl: getUnsubscribeUrl("preview"),
    })
  );

  return new Response(html, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
