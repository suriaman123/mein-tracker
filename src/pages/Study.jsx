import TrackerPage from '../components/TrackerPage'
import { useLanguage } from '../lib/LanguageContext'

export default function Study() {
  const { t } = useLanguage()
  return (
    <TrackerPage
      title={t('tracker.studyTitle')}
      table="study_logs"
      valueField="hours"
      unit={t('common.hrs')}
      valueLabel={t('tracker.hoursStudied')}
      accentClass="accent-study"
      min={0}
      max={24}
      step={0.25}
      historyPath="/study/history"
      quickAddSteps={[0.5, 1, 2]}
      quickAddKey="study"
    />
  )
}
