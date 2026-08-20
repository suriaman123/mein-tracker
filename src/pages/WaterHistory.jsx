import TrackerHistory from '../components/TrackerHistory'

export default function WaterHistory() {
  return (
    <TrackerHistory
      title="Water intake"
      table="water_logs"
      valueField="liters"
      unit="L"
      accentClass="accent-water"
      backPath="/water"
    />
  )
}
