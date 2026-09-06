import { useAuth } from '../lib/AuthContext'
import { useMonthlyStats } from '../lib/useMonthlyStats'
import { useProfile } from '../lib/useProfile'
import { useStreak } from '../lib/useStreak'
import { useLanguage } from '../lib/LanguageContext'
import Layout from '../components/Layout'
import SummaryCard from '../components/SummaryCard'
import './Dashboard.css'

export default function Dashboard() {
  const { user } = useAuth()
  const { profile } = useProfile()
  const { t, locale } = useLanguage()
  const sleep = useMonthlyStats('sleep_logs', 'hours')
  const water = useMonthlyStats('water_logs', 'liters')
  const study = useMonthlyStats('study_logs', 'hours')

  const sleepStreak = useStreak('sleep_logs')
  const waterStreak = useStreak('water_logs')
  const studyStreak = useStreak('study_logs')

  const firstName = user?.email?.split('@')[0]
  const monthName = new Date().toLocaleString(locale, { month: 'long' })

  return (
    <Layout>
      <div className="overview-header">
        <h1>{monthName} {t('dashboard.overviewSuffix')}</h1>
        <p>{t('dashboard.welcomeBack', { name: firstName })}</p>
      </div>

      <div className="summary-grid">
        <SummaryCard
          title={t('dashboard.sleepTitle')}
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
          title={t('dashboard.waterTitle')}
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
          title={t('dashboard.studyTitle')}
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
