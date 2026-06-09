export function getAppUrl() {
  return (process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000").replace(/\/$/, "");
}

export function getUnsubscribeUrl(token: string) {
  return `${getAppUrl()}/unsubscribe?token=${encodeURIComponent(token)}`;
}
