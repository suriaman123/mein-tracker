-- =========================================================
-- CUSTOM QUICK-ADD BUTTONS — run in Supabase → SQL Editor
-- (additive to schema_profiles.sql — safe to run separately)
-- =========================================================

alter table profiles
  add column if not exists quick_add_steps jsonb default '{
    "sleep": [0.5, 1, 2],
    "water": [0.25, 0.5, 1],
    "study": [0.5, 1, 2]
  }'::jsonb;
