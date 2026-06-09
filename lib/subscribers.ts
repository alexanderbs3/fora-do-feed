import { randomBytes } from "node:crypto";
import { weeklyNewsletterIssues } from "@/emails/weekly";
import { createSupabaseAdmin } from "@/lib/supabase";

export type SubscriberStatus = "active" | "unsubscribed";

export type SubscriberEvent = {
  type: "subscribed" | "welcome_sent" | "weekly_sent" | "weekly_failed" | "unsubscribed";
  at: string;
  week?: number;
  message?: string;
};

export type Subscriber = {
  id: string;
  email: string;
  name: string;
  subscribedAt: string;
  lastSentWeek: number;
  lastSentAt?: string;
  status: SubscriberStatus;
  unsubscribeToken: string;
  unsubscribedAt?: string;
  events: SubscriberEvent[];
};

type SubscriberRow = {
  id: string;
  email: string;
  name: string | null;
  subscribed_at: string;
  last_sent_week: number | null;
  last_sent_at: string | null;
  status: SubscriberStatus | null;
  unsubscribe_token: string;
  unsubscribed_at: string | null;
};

type SubscriberEventRow = {
  type: SubscriberEvent["type"];
  week: number | null;
  message: string | null;
  created_at: string;
};

const weekInMs = 7 * 24 * 60 * 60 * 1000;
const firstIssueDelayInMs = 24 * 60 * 60 * 1000;

function createToken() {
  return randomBytes(24).toString("hex");
}

function mapSubscriber(row: SubscriberRow, events: SubscriberEventRow[] = []): Subscriber {
  return {
    id: row.id,
    email: row.email,
    name: row.name || "Dev",
    subscribedAt: row.subscribed_at,
    lastSentWeek: row.last_sent_week || 0,
    lastSentAt: row.last_sent_at || undefined,
    status: row.status || "active",
    unsubscribeToken: row.unsubscribe_token,
    unsubscribedAt: row.unsubscribed_at || undefined,
    events: events.map((event) => ({
      type: event.type,
      at: event.created_at,
      week: event.week || undefined,
      message: event.message || undefined,
    })),
  };
}

async function addSubscriberEvent(input: {
  subscriberId: string;
  type: SubscriberEvent["type"];
  week?: number;
  message?: string;
}) {
  const supabase = createSupabaseAdmin();
  const { error } = await supabase.from("subscriber_events").insert({
    subscriber_id: input.subscriberId,
    type: input.type,
    week: input.week ?? null,
    message: input.message ?? null,
  });

  if (error) {
    throw new Error(`Erro ao registrar evento do inscrito: ${error.message}`);
  }
}

export async function getSubscribers() {
  const supabase = createSupabaseAdmin();
  const { data: rows, error } = await supabase
    .from("subscribers")
    .select("id,email,name,subscribed_at,last_sent_week,last_sent_at,status,unsubscribe_token,unsubscribed_at")
    .order("subscribed_at", { ascending: false });

  if (error) {
    throw new Error(`Erro ao carregar inscritos: ${error.message}`);
  }

  const subscriberRows = (rows || []) as SubscriberRow[];
  const subscriberIds = subscriberRows.map((subscriber) => subscriber.id);

  if (subscriberIds.length === 0) {
    return [];
  }

  const { data: eventRows, error: eventsError } = await supabase
    .from("subscriber_events")
    .select("subscriber_id,type,week,message,created_at")
    .in("subscriber_id", subscriberIds)
    .order("created_at", { ascending: false });

  if (eventsError) {
    throw new Error(`Erro ao carregar eventos dos inscritos: ${eventsError.message}`);
  }

  return subscriberRows.map((subscriber) =>
    mapSubscriber(
      subscriber,
      ((eventRows || []) as Array<SubscriberEventRow & { subscriber_id: string }>).filter(
        (event) => event.subscriber_id === subscriber.id
      )
    )
  );
}

export async function upsertSubscriber(input: { email: string; name: string }) {
  const supabase = createSupabaseAdmin();
  const normalizedEmail = input.email.toLowerCase().trim();

  const { data: existingSubscriber, error: findError } = await supabase
    .from("subscribers")
    .select("id,email,name,subscribed_at,last_sent_week,last_sent_at,status,unsubscribe_token,unsubscribed_at")
    .eq("email", normalizedEmail)
    .maybeSingle();

  if (findError) {
    throw new Error(`Erro ao buscar inscrito: ${findError.message}`);
  }

  if (existingSubscriber) {
    const { data: updatedSubscriber, error: updateError } = await supabase
      .from("subscribers")
      .update({
        name: input.name,
        status: "active",
        unsubscribed_at: null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", existingSubscriber.id)
      .select("id,email,name,subscribed_at,last_sent_week,last_sent_at,status,unsubscribe_token,unsubscribed_at")
      .single();

    if (updateError) {
      throw new Error(`Erro ao atualizar inscrito: ${updateError.message}`);
    }

    return mapSubscriber(updatedSubscriber as SubscriberRow);
  }

  const { data: subscriber, error: insertError } = await supabase
    .from("subscribers")
    .insert({
      email: normalizedEmail,
      name: input.name,
      unsubscribe_token: createToken(),
    })
    .select("id,email,name,subscribed_at,last_sent_week,last_sent_at,status,unsubscribe_token,unsubscribed_at")
    .single();

  if (insertError) {
    throw new Error(`Erro ao criar inscrito: ${insertError.message}`);
  }

  await addSubscriberEvent({ subscriberId: subscriber.id, type: "subscribed" });

  return mapSubscriber(subscriber as SubscriberRow, [{ type: "subscribed", week: null, message: null, created_at: new Date().toISOString() }]);
}

export async function getDueWeeklySubscribers(now = new Date()) {
  const subscribers = await getSubscribers();
  const maxWeek = weeklyNewsletterIssues.length;

  return subscribers
    .filter((subscriber) => subscriber.status === "active")
    .map((subscriber) => {
      const subscribedAt = new Date(subscriber.subscribedAt).getTime();
      const elapsed = now.getTime() - subscribedAt;
      const dueWeek =
        elapsed >= firstIssueDelayInMs ? Math.min(Math.floor((elapsed - firstIssueDelayInMs) / weekInMs) + 1, maxWeek) : 0;

      return { subscriber, dueWeek };
    })
    .filter(({ subscriber, dueWeek }) => dueWeek > 0 && dueWeek > subscriber.lastSentWeek);
}

export async function markWeeklyEmailSent(email: string, week: number) {
  const supabase = createSupabaseAdmin();
  const normalizedEmail = email.toLowerCase().trim();
  const sentAt = new Date().toISOString();

  const { data: subscriber, error: findError } = await supabase
    .from("subscribers")
    .select("id,last_sent_week")
    .eq("email", normalizedEmail)
    .maybeSingle();

  if (findError) {
    throw new Error(`Erro ao buscar inscrito: ${findError.message}`);
  }

  if (!subscriber) {
    return;
  }

  const { error: updateError } = await supabase
    .from("subscribers")
    .update({
      last_sent_week: Math.max(Number(subscriber.last_sent_week || 0), week),
      last_sent_at: sentAt,
      updated_at: sentAt,
    })
    .eq("id", subscriber.id);

  if (updateError) {
    throw new Error(`Erro ao marcar envio semanal: ${updateError.message}`);
  }

  await addSubscriberEvent({ subscriberId: subscriber.id, type: "weekly_sent", week });
}

export async function markWelcomeEmailSent(email: string) {
  const supabase = createSupabaseAdmin();
  const normalizedEmail = email.toLowerCase().trim();
  const { data: subscriber, error } = await supabase.from("subscribers").select("id").eq("email", normalizedEmail).maybeSingle();

  if (error) {
    throw new Error(`Erro ao buscar inscrito: ${error.message}`);
  }

  if (!subscriber) {
    return;
  }

  await addSubscriberEvent({ subscriberId: subscriber.id, type: "welcome_sent" });
}

export async function markWeeklyEmailFailed(email: string, week: number, message: string) {
  const supabase = createSupabaseAdmin();
  const normalizedEmail = email.toLowerCase().trim();
  const { data: subscriber, error } = await supabase.from("subscribers").select("id").eq("email", normalizedEmail).maybeSingle();

  if (error) {
    throw new Error(`Erro ao buscar inscrito: ${error.message}`);
  }

  if (!subscriber) {
    return;
  }

  await addSubscriberEvent({ subscriberId: subscriber.id, type: "weekly_failed", week, message });
}

export async function unsubscribeByToken(token: string) {
  const supabase = createSupabaseAdmin();
  const unsubscribedAt = new Date().toISOString();
  const { data: subscriber, error: findError } = await supabase
    .from("subscribers")
    .select("id,email,name,subscribed_at,last_sent_week,last_sent_at,status,unsubscribe_token,unsubscribed_at")
    .eq("unsubscribe_token", token)
    .maybeSingle();

  if (findError) {
    throw new Error(`Erro ao buscar token de descadastro: ${findError.message}`);
  }

  if (!subscriber) {
    return null;
  }

  const { data: updatedSubscriber, error: updateError } = await supabase
    .from("subscribers")
    .update({
      status: "unsubscribed",
      unsubscribed_at: unsubscribedAt,
      updated_at: unsubscribedAt,
    })
    .eq("id", subscriber.id)
    .select("id,email,name,subscribed_at,last_sent_week,last_sent_at,status,unsubscribe_token,unsubscribed_at")
    .single();

  if (updateError) {
    throw new Error(`Erro ao cancelar inscrição: ${updateError.message}`);
  }

  await addSubscriberEvent({ subscriberId: subscriber.id, type: "unsubscribed" });

  return mapSubscriber(updatedSubscriber as SubscriberRow);
}

export function getSubscriberStats(subscribers: Subscriber[]) {
  const active = subscribers.filter((subscriber) => subscriber.status === "active").length;
  const unsubscribed = subscribers.filter((subscriber) => subscriber.status === "unsubscribed").length;
  const sent = subscribers.reduce(
    (total, subscriber) => total + subscriber.events.filter((event) => event.type === "weekly_sent").length,
    0
  );
  const failed = subscribers.reduce(
    (total, subscriber) => total + subscriber.events.filter((event) => event.type === "weekly_failed").length,
    0
  );

  return { total: subscribers.length, active, unsubscribed, sent, failed };
}
