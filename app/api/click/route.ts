import { NextRequest, NextResponse } from "next/server";
import { recordNewsletterClick } from "@/lib/click-tracking";

export const dynamic = "force-dynamic";

function getSafeTarget(value: string | null) {
  if (!value) {
    return null;
  }

  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:" ? url.toString() : null;
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const target = getSafeTarget(params.get("u"));

  if (!target) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  const editionId = params.get("e") || "";
  const itemIndex = Number(params.get("i") || 0);
  const token = params.get("t") || undefined;

  if (editionId && Number.isFinite(itemIndex)) {
    try {
      await recordNewsletterClick({ editionId, itemIndex, token, url: target, userAgent: request.headers.get("user-agent") });
    } catch (error) {
      console.error(JSON.stringify({ scope: "newsletter-click", message: error instanceof Error ? error.message : String(error) }));
    }
  }

  return NextResponse.redirect(target);
}
