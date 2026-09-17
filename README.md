# Mein Tracker

A personal habit tracker for sleep, water, and study — plus any custom
tracker you want to add. Free forever, hosted on GitHub Pages, backed by
Supabase.

**Live app:** https://suriaman123.github.io/mein-tracker/

## Features

- Email/password login (Supabase Auth — passwords properly hashed, never
  handled in plaintext)
- Sleep, water, and study trackers: log, edit, delete, monthly average,
  streaks
- Create your own trackers — numeric (e.g. mood 1–10) or Yes/No (e.g. gym)
- Dashboard overview with goals, progress bars, and streaks
- Monthly and weekly views, with a chart or calendar-grid view for each
  tracker
- Yearly history per tracker with CSV export, filtering, and sorting
- Achievements: personal bests, longest streaks, badges
- Profile with photo, personal details, and daily goals
- Full data export/backup as JSON
- Installable as a PWA (works offline for cached views)
- Dark and light mode
- English, German, and Hindi

## Tech stack

- React + Vite
- Supabase (Postgres, Auth, Storage) for the backend
- Recharts for charts
- Deployed to GitHub Pages via `gh-pages`



### Local setup

```bash
npm install
cp .env.example .env   # fill in your Supabase URL and anon key
npm run dev
```

Run the SQL files in `schema*.sql` (in order) against your own Supabase
project before first use.



`create by suriaman123 and Claude.ai `