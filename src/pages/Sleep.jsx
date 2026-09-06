import TrackerPage from '../components/TrackerPage'
import { useLanguage } from '../lib/LanguageContext'

export default function Sleep() {
  const { t } = useLanguage()
  return (
    <TrackerPage
      title={t('tracker.sleepTitle')}
      table="sleep_logs"
      valueField="hours"
      unit={t('common.hrs')}
      valueLabel={t('tracker.hoursSlept')}
      accentClass="accent-sleep"
      min={0}
      max={24}
      step={0.25}
      historyPath="/sleep/history"
      quickAddSteps={[0.5, 1, 2]}
      quickAddKey="sleep"
    />
  )
}
