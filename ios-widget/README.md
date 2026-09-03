# iOS Home Screen Widget (via Scriptable)

This is a **view-only** widget showing this month's averages and streaks
for Sleep, Water, and Study — built with [Scriptable](https://scriptable.app),
a free App Store app that lets you write small JavaScript widgets. No Apple
Developer account, no fee, nothing to publish.

It can't log new entries — for that you still open the actual web app.

## Setup

1. Install **Scriptable** from the App Store (free).
2. Open Scriptable → tap **+** (top right) to create a new script.
3. Delete the placeholder content, paste in the entire contents of
   `mein-tracker-widget.js`.
4. Tap the script's title at the top of the editor and rename it to
   `Mein Tracker` (the name matters — you'll pick it by this name later).
5. Near the top of the script, fill in two values:
   - `SUPABASE_URL` — same as `VITE_SUPABASE_URL` in your app's `.env`
   - `SUPABASE_ANON_KEY` — same as `VITE_SUPABASE_ANON_KEY` in your app's `.env`
   (Both are safe to have here — the anon key is meant to be public;
   your data is protected by Supabase Row Level Security, not by hiding
   this key.)
6. Near the bottom, fill in `widget.url` with your actual GitHub Pages
   URL, e.g. `https://yourname.github.io/mein-tracker/#/dashboard` —
   this makes tapping the widget open the real app.
7. Tap the **▶ Play** button once inside the editor to test it. The
   first run will ask for your app's email and password — enter them
   once. They're stored in the device's encrypted Keychain (private to
   this script, not visible anywhere else) so you won't be asked again.
8. If it works, you'll see a preview of the widget at the bottom of the
   editor. If you see an error message instead, see Troubleshooting below.

## Adding it to your home screen

1. Long-press an empty area of your home screen → tap **+** in the top
   corner.
2. Search for **Scriptable** → choose a size (Small or Medium both
   look good; Medium shows a bit more breathing room).
3. Tap **Add Widget**, then tap the new placeholder widget on your home
   screen → **Edit Widget** → under **Script**, choose `Mein Tracker`.

Done — it'll refresh periodically (iOS decides the exact interval, this
script hints ~30 minutes) and shows fresh averages each time you glance
at it.

## Troubleshooting

- **"Error: Login failed"** — double check email/password. To make it
  ask again, delete and recreate the script (Keychain entries are tied
  to the script), or manually clear via a one-off script calling
  `Keychain.remove('mt_email')` and `Keychain.remove('mt_password')`.
- **"Error: Failed to fetch"** or similar network error — double check
  `SUPABASE_URL` has no typo and no trailing slash.
- **Widget shows old data** — tap it once to force-open the app (which
  confirms it's working), or just wait — iOS controls the actual
  refresh cadence and doesn't guarantee exactly 30 minutes.
- **Values look wrong** — the widget computes "this month" the same way
  the web app does; if you just logged something, give the widget a
  minute or manually trigger the script once in Scriptable to confirm.
