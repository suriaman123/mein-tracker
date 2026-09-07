import { useParams, Navigate } from 'react-router-dom'
import { useCustomTracker } from '../lib/useCustomTracker'
import { useLanguage } from '../lib/LanguageContext'
import TrackerPage from '../components/TrackerPage'
import Layout from '../components/Layout'

export default function CustomTrackerPage() {
  const { trackerId } = useParams()
  const { tracker, loading, error } = useCustomTracker(trackerId)
  const { t } = useLanguage()

  if (loading) {
    return (
      <Layout>
        <p className="tracker-empty">{t('tracker.loading')}</p>
      </Layout>
    )
  }

  if (error || !tracker) {
    return <Navigate to="/dashboard" replace />
  }

  return (
    <TrackerPage
      title={tracker.name}
      table="custom_tracker_logs"
      valueField="value"
      unit={tracker.unit}
      valueLabel={`${tracker.name} (${tracker.unit})`}
      accentClass={`accent-${tracker.color_key}`}
      min={Number(tracker.min_value)}
      max={Number(tracker.max_value)}
      step={Number(tracker.step)}
      historyPath={`/custom/${trackerId}/history`}
      extraFilter={{ column: 'tracker_id', value: trackerId }}
      extraInsertFields={{ tracker_id: trackerId }}
      conflictTarget="tracker_id,log_date"
    />
  )
}
