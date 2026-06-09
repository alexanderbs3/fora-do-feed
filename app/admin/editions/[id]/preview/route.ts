import { NextRequest } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getEditionById, renderEditionHtml } from "@/lib/editions";
import { getUnsubscribeUrl } from "@/lib/urls";

type PreviewRouteProps = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: NextRequest, { params }: PreviewRouteProps) {
  if (!(await isAdminAuthenticated())) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { id } = await params;
  const edition = await getEditionById(id);
  if (!edition) {
    return new Response("Not found", { status: 404 });
  }

  return new Response(renderEditionHtml(edition, getUnsubscribeUrl("preview")), {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
