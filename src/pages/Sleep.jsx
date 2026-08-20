import TrackerPage from '../components/TrackerPage'

export default function Sleep() {
  return (
    <TrackerPage
      title="Sleep tracker"
      table="sleep_logs"
      valueField="hours"
      unit="hrs"
      valueLabel="Hours slept"
      accentClass="accent-sleep"
      min={0}
      max={24}
      step={0.25}
      historyPath="/sleep/history"
    />
  )
}
