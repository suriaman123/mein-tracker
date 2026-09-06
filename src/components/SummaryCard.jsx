import { Link, useNavigate } from 'react-router-dom'
import { useLanguage } from '../lib/LanguageContext'

export default function SummaryCard({
  title,
  unit,
  average,
  count,
  loading,
  error,
  to,
  accentClass,
  goal,
  streak = 0,
}) {
  const navigate = useNavigate()
  const { t } = useLanguage()
  const numericGoal = goal !== null && goal !== undefined && goal !== '' ? Number(goal) : null
  const hasGoal = numericGoal !== null && !Number.isNaN(numericGoal) && numericGoal > 0
  const progressPercent = hasGoal && count > 0 ? Math.min(100, (average / numericGoal) * 100) : 0
  const metGoal = hasGoal && average >= numericGoal

  function goToProfile(e) {
    e.preventDefault()
    e.stopPropagation()
    navigate('/profile')
  }

  return (
    <Link to={to} className={`summary-card ${accentClass}`}>
      <div className="summary-card-top">
        <span className="summary-card-title">{title}</span>
        <span className="summary-card-arrow" aria-hidden="true">→</span>
      </div>

      {loading ? (
        <div className="summary-card-loading">{t('tracker.loading')}</div>
      ) : error ? (
        <div className="summary-card-error">{t('dashboard.couldntLoad')}</div>
      ) : (
        <>
          <div className="summary-card-average">
            {count === 0 ? '—' : average.toFixed(1)}
            <span className="summary-card-unit">{count === 0 ? '' : unit}</span>
          </div>
          <div className="summary-card-meta">
            {count === 0
              ? t('dashboard.noEntries')
              : t(count === 1 ? 'dashboard.avgOverEntry' : 'dashboard.avgOverEntries', { count })}
          </div>

          {streak > 0 && (
            <div className="summary-card-streak">
              <span aria-hidden="true">🔥</span> {t('dashboard.dayStreak', { count: streak })}
            </div>
          )}

          {hasGoal && count > 0 && (
            <div className="summary-card-goal">
              <div className="goal-bar-track">
                <div
                  className={`goal-bar-fill${metGoal ? ' goal-bar-met' : ''}`}
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <div className="goal-bar-label">
                {metGoal
                  ? t('dashboard.goalReached', { goal: numericGoal, unit })
                  : t('dashboard.percentOfGoal', {
                      percent: Math.round(progressPercent),
                      goal: numericGoal,
                      unit,
                    })}
              </div>
            </div>
          )}

          {!hasGoal && (
            <span className="summary-card-set-goal" onClick={goToProfile}>
              {t('dashboard.setGoal')}
            </span>
          )}
        </>
      )}
    </Link>
  )
}
