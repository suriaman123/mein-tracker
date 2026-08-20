import TrackerPage from '../components/TrackerPage'

export default function Water() {
  return (
    <TrackerPage
      title="Water intake tracker"
      table="water_logs"
      valueField="liters"
      unit="L"
      valueLabel="Liters drunk"
      accentClass="accent-water"
      min={0}
      max={15}
      step={0.1}
      historyPath="/water/history"
    />
  )
}
