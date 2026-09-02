import TrackerPage from '../components/TrackerPage'

export default function Personal() {
  return (
    <TrackerPage
      title="हस्तमैथुन"
      table="personal_logs"
      valueField="count"
      unit="times"
      valueLabel="Times today"
      accentClass="accent-hidden"
      min={0}
      max={50}
      step={1}
      historyPath="/personal/history"
    />
  )
}
