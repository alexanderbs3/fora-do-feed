import { render } from "@react-email/render";
import WeeklyNewsletterEmail from "@/emails/weekly/WeeklyNewsletterEmail";
import { getUnsubscribeUrl } from "@/lib/urls";

type PreviewRouteProps = {
  params: Promise<{ week: string }>;
};

function isAuthorized(request: Request) {
  const adminSecret = process.env.ADMIN_SECRET;
  const secret = new URL(request.url).searchParams.get("secret");

  return Boolean(adminSecret && secret === adminSecret);
}

export async function GET(request: Request, { params }: PreviewRouteProps) {
  if (!isAuthorized(request)) {
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
