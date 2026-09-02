-- =========================================================
-- HIDDEN TRACKER (personal_logs) — run in Supabase → SQL Editor
-- (additive — safe to run separately from schema.sql / schema_profiles.sql)
-- =========================================================

create table personal_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  log_date date not null,
  count numeric(5,2) not null check (count >= 0),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, log_date)
);

alter table personal_logs enable row level security;

create policy "Users manage their own personal logs"
  on personal_logs for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create trigger trg_personal_updated before update on personal_logs
  for each row execute function set_updated_at();
