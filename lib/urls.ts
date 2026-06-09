export function getAppUrl() {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  const vercelUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "";

  return (appUrl || vercelUrl || "http://localhost:3000").replace(/\/$/, "");
}

export function getUnsubscribeUrl(token: string) {
  return `${getAppUrl()}/unsubscribe?token=${encodeURIComponent(token)}`;
}
