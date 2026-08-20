-- =========================================================
-- PROFILE + GOALS — run this in Supabase → SQL Editor
-- (additive to schema.sql — safe to run separately)
-- =========================================================

create table profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  age integer check (age >= 0 and age <= 150),
  height_cm numeric(5,1) check (height_cm >= 0),
  weight_kg numeric(5,1) check (weight_kg >= 0),
  avatar_url text,
  goal_sleep_hours numeric(4,2),
  goal_water_liters numeric(4,2),
  goal_study_hours numeric(4,2),
  updated_at timestamptz not null default now()
);

alter table profiles enable row level security;

create policy "Users manage their own profile"
  on profiles for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create trigger trg_profiles_updated before update on profiles
  for each row execute function set_updated_at();

-- =========================================================
-- AVATAR STORAGE
-- =========================================================
-- 1. In Supabase Dashboard → Storage, click "New bucket".
--    Name it exactly: avatars
--    Toggle "Public bucket" ON (so avatar images can be displayed
--    directly via URL without extra auth calls).
-- 2. Then run the policies below so each user can only upload/
--    replace/delete files inside their OWN folder (named after
--    their user id), while anyone can view (since the bucket is public).

create policy "Avatar images are publicly viewable"
  on storage.objects for select
  using (bucket_id = 'avatars');

create policy "Users can upload their own avatar"
  on storage.objects for insert
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Users can update their own avatar"
  on storage.objects for update
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Users can delete their own avatar"
  on storage.objects for delete
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
