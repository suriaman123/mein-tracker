import TrackerPage from '../components/TrackerPage'
import { useLanguage } from '../lib/LanguageContext'

export default function Personal() {
  const { t } = useLanguage()
  return (
    <TrackerPage
      title="हस्तमैथुन"
      table="personal_logs"
      valueField="count"
      unit={t('common.times')}
      valueLabel={t('tracker.timesToday')}
      accentClass="accent-hidden"
      min={0}
      max={50}
      step={1}
      historyPath="/personal/history"
    />
  )
}
