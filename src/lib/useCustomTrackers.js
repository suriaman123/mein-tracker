// Re-exported from the shared context so every consumer (nav bar,
// dashboard, achievements, settings) sees the same live list — editing
// a tracker in Settings now shows up everywhere immediately, without a
// page reload. See CustomTrackersContext.jsx for the actual implementation.
export { useCustomTrackers } from './CustomTrackersContext'
