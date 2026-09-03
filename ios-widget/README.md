# iOS Home Screen Widget (via Scriptable)

This is a **view-only** widget showing this month's averages and streaks
for Sleep, Water, and Study — built with [Scriptable](https://scriptable.app),
a free App Store app that lets you write small JavaScript widgets. No Apple
Developer account, no fee, nothing to publish.

It can't log new entries — for that, you still open the actual web app.

## Setup
1. Install **Scriptable** from the App Store (free).
2. Open Scriptable → tap **+** (top right) to create a new script.
3. Delete the placeholder content, paste in the entire contents of
   `mein-tracker-widget.js`.
4. Tap the script's title at the top of the editor and rename it to
   `Mein Tracker` (the name matters — you'll pick it by this name later).
5. Tap the **▶ Play** button once inside the editor to test it. The
   first run will ask for your app's email and password — enter them
   once. They're stored in the device's encrypted Keychain (private to
   this script, not visible anywhere else) so you won't be asked again.

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

