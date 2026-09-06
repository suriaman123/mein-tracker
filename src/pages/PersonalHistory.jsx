import TrackerHistory from '../components/TrackerHistory'
import { useLanguage } from '../lib/LanguageContext'

export default function PersonalHistory() {
  const { t } = useLanguage()
  return (
    <TrackerHistory
      title="हस्तमैथुन"
      table="personal_logs"
      valueField="count"
      unit={t('common.times')}
      accentClass="accent-hidden"
      backPath="/personal"
    />
  )
}
