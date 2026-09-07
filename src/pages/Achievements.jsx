import { useLanguage } from '../lib/LanguageContext'
import { useCustomTrackers } from '../lib/useCustomTrackers'
import { useHiddenMode } from '../lib/HiddenModeContext'
import Layout from '../components/Layout'
import TrackerAchievements from '../components/TrackerAchievements'
import './Achievements.css'

export default function Achievements() {
  const { t } = useLanguage()
  const { trackers: customTrackers } = useCustomTrackers()
  const { hidden } = useHiddenMode()

  return (
    <Layout>
      <div className="overview-header">
        <h1>{t('achievements.pageTitle')}</h1>
        <p>{t('achievements.pageSubtitle')}</p>
      </div>

      <div className="achievements-grid">
        <TrackerAchievements
          title={t('dashboard.sleepTitle')}
          table="sleep_logs"
          valueField="hours"
          unit="hrs"
          accentClass="accent-sleep"
        />
        <TrackerAchievements
          title={t('dashboard.waterTitle')}
          table="water_logs"
          valueField="liters"
          unit="L"
          accentClass="accent-water"
        />
        <TrackerAchievements
          title={t('dashboard.studyTitle')}
          table="study_logs"
          valueField="hours"
          unit="hrs"
          accentClass="accent-study"
        />

        {customTrackers.map((tracker) => (
          <TrackerAchievements
            key={tracker.id}
            title={tracker.name}
            table="custom_tracker_logs"
            valueField="value"
            unit={tracker.unit}
            accentClass={`accent-${tracker.color_key}`}
            extraFilter={{ column: 'tracker_id', value: tracker.id }}
          />
        ))}

        {hidden && (
          <TrackerAchievements
            title="हस्तमैथुन"
            table="personal_logs"
            valueField="count"
            unit={t('common.times')}
            accentClass="accent-hidden"
          />
        )}
      </div>
    </Layout>
  )
}
