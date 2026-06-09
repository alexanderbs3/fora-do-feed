export function getAppUrl() {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  const vercelUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "";

  return (appUrl || vercelUrl || "http://localhost:3000").replace(/\/$/, "");
}

export function getUnsubscribeUrl(token: string) {
  return `${getAppUrl()}/unsubscribe?token=${encodeURIComponent(token)}`;
}

export function getTrackedClickUrl(input: { editionId: string; itemIndex: number; token: string; url: string }) {
  const params = new URLSearchParams({ e: input.editionId, i: String(input.itemIndex), t: input.token, u: input.url });
  return `${getAppUrl()}/api/click?${params.toString()}`;
}
