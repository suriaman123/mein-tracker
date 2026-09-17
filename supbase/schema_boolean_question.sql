-- =========================================================
-- CUSTOM QUESTION TEXT FOR BOOLEAN TRACKERS
-- run in Supabase → SQL Editor (additive)
-- =========================================================

alter table custom_trackers
  add column if not exists boolean_question text;

-- NULL means "use the app's default translated question" — a tracker
-- doesn't need custom text unless the user wants it.
