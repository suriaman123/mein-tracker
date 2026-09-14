import { useCustomTrackers } from './CustomTrackersContext'

// Derives a single tracker from the shared list (see CustomTrackersContext)
// instead of a separate fetch — guarantees this always reflects the exact
// same data as everywhere else in the app, so editing a tracker's min/max/
// unit/name in Settings takes effect immediately on its own page too.
export function useCustomTracker(id) {
  const { trackers, loading } = useCustomTrackers()
  const tracker = trackers.find((t) => t.id === id) || null
  return { tracker, loading, error: '' }
}
