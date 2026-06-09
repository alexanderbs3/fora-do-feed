import { render } from "@react-email/render";
import WelcomeEmail from "@/emails/WelcomeEmail";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getUnsubscribeUrl } from "@/lib/urls";

export async function GET() {
  if (!(await isAdminAuthenticated())) {
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
