import { useMonthlyStats } from '../lib/useMonthlyStats'
import { useStreak } from '../lib/useStreak'
import SummaryCard from './SummaryCard'

export default function CustomTrackerSummaryCard({ tracker }) {
  const extraFilter = { column: 'tracker_id', value: tracker.id }
  const stats = useMonthlyStats('custom_tracker_logs', 'value', extraFilter)
  const streakInfo = useStreak('custom_tracker_logs', extraFilter)
  const isBoolean = tracker.value_type === 'boolean'

  return (
    <SummaryCard
      title={tracker.name}
      unit={isBoolean ? '%' : tracker.unit}
      average={isBoolean ? stats.average * 100 : stats.average}
      count={stats.count}
      loading={stats.loading}
      error={stats.error}
      to={`/custom/${tracker.id}`}
      accentClass={`accent-${tracker.color_key}`}
      streak={streakInfo.streak}
    />
  )
}
