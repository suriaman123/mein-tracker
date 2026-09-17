-- =========================================================
-- BOOLEAN TRACKER SUPPORT — run in Supabase → SQL Editor
-- (additive to schema_custom_trackers.sql)
-- =========================================================

alter table custom_trackers
  add column if not exists value_type text not null default 'number'
  check (value_type in ('number', 'boolean'));
