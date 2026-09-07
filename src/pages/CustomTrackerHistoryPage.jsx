import { useParams, Navigate } from 'react-router-dom'
import { useCustomTracker } from '../lib/useCustomTracker'
import { useLanguage } from '../lib/LanguageContext'
import TrackerHistory from '../components/TrackerHistory'
import Layout from '../components/Layout'

export default function CustomTrackerHistoryPage() {
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
    <TrackerHistory
      title={tracker.name}
      table="custom_tracker_logs"
      valueField="value"
      unit={tracker.unit}
      accentClass={`accent-${tracker.color_key}`}
      backPath={`/custom/${trackerId}`}
      extraFilter={{ column: 'tracker_id', value: trackerId }}
    />
  )
}
