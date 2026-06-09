import type { Subscriber } from "@/lib/subscribers";

function daysAgo(days: number) {
  return Date.now() - days * 24 * 60 * 60 * 1000;
}

export function getGrowthAnalytics(subscribers: Subscriber[]) {
  const last7 = daysAgo(7);
  const last30 = daysAgo(30);
  const subscribedLast7 = subscribers.filter((subscriber) => new Date(subscriber.subscribedAt).getTime() >= last7).length;
  const subscribedLast30 = subscribers.filter((subscriber) => new Date(subscriber.subscribedAt).getTime() >= last30).length;
  const unsubscribedLast30 = subscribers.filter(
    (subscriber) => subscriber.unsubscribedAt && new Date(subscriber.unsubscribedAt).getTime() >= last30
  ).length;
  const active = subscribers.filter((subscriber) => subscriber.status === "active").length;
  const retentionRate = subscribers.length > 0 ? Math.round((active / subscribers.length) * 100) : 100;

  return {
    subscribedLast7,
    subscribedLast30,
    unsubscribedLast30,
    netLast30: subscribedLast30 - unsubscribedLast30,
    retentionRate,
  };
}
