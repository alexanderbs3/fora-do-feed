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

create table if not exists public.newsletter_editions (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  status text not null default 'draft' check (status in ('draft', 'approved', 'sent')),
  intro text not null,
  items jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  approved_at timestamptz,
  sent_at timestamptz
);

create table if not exists public.news_items (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  url text not null unique,
  source text not null,
  published_at timestamptz,
  summary text,
  score integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists newsletter_editions_status_created_at_idx on public.newsletter_editions (status, created_at desc);
create index if not exists newsletter_editions_slug_idx on public.newsletter_editions (slug);
create index if not exists news_items_score_created_at_idx on public.news_items (score desc, created_at desc);
create index if not exists news_items_published_at_idx on public.news_items (published_at desc);

alter table public.newsletter_editions enable row level security;
alter table public.news_items enable row level security;

grant select, insert, update, delete on public.newsletter_editions to service_role;
grant select, insert, update, delete on public.news_items to service_role;

create table if not exists public.cron_locks (
  name text primary key,
  owner text not null,
  locked_until timestamptz not null,
  updated_at timestamptz not null default now()
);

create index if not exists cron_locks_locked_until_idx on public.cron_locks (locked_until);

alter table public.cron_locks enable row level security;

grant select, insert, update, delete on public.cron_locks to service_role;
