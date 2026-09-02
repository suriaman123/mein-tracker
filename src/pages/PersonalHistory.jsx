import TrackerHistory from '../components/TrackerHistory'

export default function PersonalHistory() {
  return (
    <TrackerHistory
      title="हस्तमैथुन"
      table="personal_logs"
      valueField="count"
      unit="times"
      accentClass="accent-hidden"
      backPath="/personal"
    />
  )
}
