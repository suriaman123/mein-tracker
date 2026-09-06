import TrackerPage from '../components/TrackerPage'
import { useLanguage } from '../lib/LanguageContext'

export default function Water() {
  const { t } = useLanguage()
  return (
    <TrackerPage
      title={t('tracker.waterTitle')}
      table="water_logs"
      valueField="liters"
      unit={t('common.liters')}
      valueLabel={t('tracker.litersDrunk')}
      accentClass="accent-water"
      min={0}
      max={15}
      step={0.1}
      historyPath="/water/history"
      quickAddSteps={[0.25, 0.5, 1]}
      quickAddKey="water"
    />
  )
}
