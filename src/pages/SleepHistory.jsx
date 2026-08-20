import TrackerHistory from '../components/TrackerHistory'

export default function SleepHistory() {
  return (
    <TrackerHistory
      title="Sleep"
      table="sleep_logs"
      valueField="hours"
      unit="hrs"
      accentClass="accent-sleep"
      backPath="/sleep"
    />
  )
}
