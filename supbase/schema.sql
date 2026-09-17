-- =========================================================
-- LIFE TRACKER — DATABASE SCHEMA
-- Run this once in Supabase → SQL Editor → New query → Run
-- =========================================================
-- Note: user accounts (login/register, password hashing) are
-- handled entirely by Supabase Auth — you never store or touch
-- raw passwords. auth.users already exists automatically.

-- ---------- SLEEP TRACKER ----------
create table sleep_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  log_date date not null,
  hours numeric(4,2) not null check (hours >= 0 and hours <= 24),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, log_date)
);

-- ---------- WATER INTAKE TRACKER ----------
create table water_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  log_date date not null,
  liters numeric(4,2) not null check (liters >= 0),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, log_date)
);

-- ---------- STUDY HOURS TRACKER ----------
create table study_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  log_date date not null,
  hours numeric(4,2) not null check (hours >= 0 and hours <= 24),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, log_date)
);

-- =========================================================
-- ROW LEVEL SECURITY — a user can only ever see/edit their own rows
-- =========================================================
alter table sleep_logs enable row level security;
alter table water_logs enable row level security;
alter table study_logs enable row level security;

create policy "Users manage their own sleep logs"
  on sleep_logs for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users manage their own water logs"
  on water_logs for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users manage their own study logs"
  on study_logs for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- =========================================================
-- Auto-update "updated_at" on edit
-- =========================================================
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger trg_sleep_updated before update on sleep_logs
  for each row execute function set_updated_at();
create trigger trg_water_updated before update on water_logs
  for each row execute function set_updated_at();
create trigger trg_study_updated before update on study_logs
  for each row execute function set_updated_at();
