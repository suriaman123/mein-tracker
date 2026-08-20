import TrackerHistory from '../components/TrackerHistory'

export default function StudyHistory() {
  return (
    <TrackerHistory
      title="Study hours"
      table="study_logs"
      valueField="hours"
      unit="hrs"
      accentClass="accent-study"
      backPath="/study"
    />
  )
}
