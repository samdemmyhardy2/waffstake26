-- Run once in the Supabase SQL editor for your project.

create table if not exists public.waffstake_sync (
  id text primary key,
  game_state jsonb not null,
  activity_feed jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.waffstake_sync enable row level security;

create policy "waffstake_sync_read"
  on public.waffstake_sync
  for select
  using (true);

create policy "waffstake_sync_insert"
  on public.waffstake_sync
  for insert
  with check (true);

create policy "waffstake_sync_update"
  on public.waffstake_sync
  for update
  using (true);
