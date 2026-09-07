-- =========================================================
-- CUSTOM TRACKERS — run in Supabase → SQL Editor
-- (additive — safe to run separately from earlier schema files)
-- =========================================================

-- One row per tracker the user creates (e.g. "Mood", "Screen time", "Gym").
create table custom_trackers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  unit text not null,
  min_value numeric not null default 0,
  max_value numeric not null default 100,
  step numeric not null default 1,
  color_key text not null default 'custom-1',
  created_at timestamptz not null default now()
);

alter table custom_trackers enable row level security;

create policy "Users manage their own custom trackers"
  on custom_trackers for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- All custom trackers' daily entries share one table, distinguished by
-- tracker_id — this avoids needing to create a new physical table every
-- time someone adds a tracker (not possible from the client anyway).
create table custom_tracker_logs (
  id uuid primary key default gen_random_uuid(),
  tracker_id uuid not null references custom_trackers(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  log_date date not null,
  value numeric not null,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tracker_id, log_date)
);

alter table custom_tracker_logs enable row level security;

create policy "Users manage their own custom tracker logs"
  on custom_tracker_logs for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create trigger trg_custom_tracker_logs_updated before update on custom_tracker_logs
  for each row execute function set_updated_at();
