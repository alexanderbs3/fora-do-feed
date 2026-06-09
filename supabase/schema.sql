create extension if not exists pgcrypto;

create table if not exists public.subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  name text,
  subscribed_at timestamptz not null default now(),
  last_sent_week integer not null default 0,
  last_sent_at timestamptz,
  status text not null default 'active' check (status in ('active', 'unsubscribed')),
  unsubscribe_token text not null unique,
  unsubscribed_at timestamptz,
  updated_at timestamptz not null default now()
);

create table if not exists public.subscriber_events (
  id uuid primary key default gen_random_uuid(),
  subscriber_id uuid not null references public.subscribers(id) on delete cascade,
  type text not null check (type in ('subscribed', 'welcome_sent', 'weekly_sent', 'weekly_failed', 'unsubscribed')),
  week integer,
  message text,
  created_at timestamptz not null default now()
);

create index if not exists subscribers_email_idx on public.subscribers (email);
create index if not exists subscribers_status_idx on public.subscribers (status);
create index if not exists subscribers_unsubscribe_token_idx on public.subscribers (unsubscribe_token);
create index if not exists subscriber_events_subscriber_id_created_at_idx on public.subscriber_events (subscriber_id, created_at desc);

alter table public.subscribers enable row level security;
alter table public.subscriber_events enable row level security;

grant usage on schema public to service_role;
grant select, insert, update, delete on public.subscribers to service_role;
grant select, insert, update, delete on public.subscriber_events to service_role;
