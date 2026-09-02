import { useAuth } from '../lib/AuthContext'
import { useMonthlyStats } from '../lib/useMonthlyStats'
import { useProfile } from '../lib/useProfile'
import { useStreak } from '../lib/useStreak'
import Layout from '../components/Layout'
import SummaryCard from '../components/SummaryCard'
import './Dashboard.css'

const MONTH_NAME = new Date().toLocaleString('default', { month: 'long' })

export default function Dashboard() {
  const { user } = useAuth()
  const { profile } = useProfile()
  const sleep = useMonthlyStats('sleep_logs', 'hours')
  const water = useMonthlyStats('water_logs', 'liters')
  const study = useMonthlyStats('study_logs', 'hours')

  const sleepStreak = useStreak('sleep_logs')
  const waterStreak = useStreak('water_logs')
  const studyStreak = useStreak('study_logs')

  const firstName = user?.email?.split('@')[0]

  return (
    <Layout>
      <div className="overview-header">
        <h1>{MONTH_NAME} overview</h1>
        <p>Welcome back, {firstName}. Here's how this month is looking.</p>
      </div>

      <div className="summary-grid">
        <SummaryCard
          title="Sleep"
          unit="hrs / night"
          average={sleep.average}
          count={sleep.count}
          loading={sleep.loading}
          error={sleep.error}
          to="/sleep"
          accentClass="accent-sleep"
          goal={profile?.goal_sleep_hours}
          streak={sleepStreak.streak}
        />
        <SummaryCard
          title="Water intake"
          unit="L / day"
          average={water.average}
          count={water.count}
          loading={water.loading}
          error={water.error}
          to="/water"
          accentClass="accent-water"
          goal={profile?.goal_water_liters}
          streak={waterStreak.streak}
        />
        <SummaryCard
          title="Study time"
          unit="hrs / day"
          average={study.average}
          count={study.count}
          loading={study.loading}
          error={study.error}
          to="/study"
          accentClass="accent-study"
          goal={profile?.goal_study_hours}
          streak={studyStreak.streak}
        />
      </div>
    </Layout>
  )
}
