import { render } from "@react-email/render";
import WelcomeEmail from "@/emails/WelcomeEmail";
import { getUnsubscribeUrl } from "@/lib/urls";

function isAuthorized(request: Request) {
  const adminSecret = process.env.ADMIN_SECRET;
  const secret = new URL(request.url).searchParams.get("secret");

  return Boolean(adminSecret && secret === adminSecret);
}

export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return new Response("Unauthorized", { status: 401 });
  }

  const html = await render(
    WelcomeEmail({
      name: "Alexander",
      unsubscribeUrl: getUnsubscribeUrl("preview"),
    })
  );

  return new Response(html, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
