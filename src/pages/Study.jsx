import TrackerPage from '../components/TrackerPage'

export default function Study() {
  return (
    <TrackerPage
      title="Study hours tracker"
      table="study_logs"
      valueField="hours"
      unit="hrs"
      valueLabel="Hours studied"
      accentClass="accent-study"
      min={0}
      max={24}
      step={0.25}
      historyPath="/study/history"
    />
  )
}
