import { useAllTimeStats } from '../lib/useAllTimeStats'
import { useLanguage } from '../lib/LanguageContext'
import { CUSTOM_COLOR_PRESETS } from '../lib/colorPresets'

const STREAK_MILESTONES = [7, 30, 100]

const ACCENT_COLORS = {
  'accent-sleep': '#8FA3F3',
  'accent-water': '#6FCF97',
  'accent-study': '#F2C94C',
  'accent-hidden': '#FF7A00',
  ...Object.fromEntries(CUSTOM_COLOR_PRESETS.map((c) => [`accent-${c.key}`, c.hex])),
}

export default function TrackerAchievements({ title, table, valueField, unit, accentClass, extraFilter }) {
  const { t, locale } = useLanguage()
  const stats = useAllTimeStats(table, valueField, extraFilter)
  const color = ACCENT_COLORS[accentClass] || '#8FA3F3'

  function formatDate(dateStr) {
    return new Date(dateStr + 'T00:00:00').toLocaleDateString(locale, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  if (stats.loading) {
    return null
  }

  if (stats.count === 0) {
    return (
      <div className="achievement-card" style={{ '--card-accent': color }}>
        <div className="achievement-card-header">
          <h2>{title}</h2>
        </div>
        <p className="tracker-empty">{t('achievements.noDataYet')}</p>
      </div>
    )
  }

  return (
    <div className="achievement-card" style={{ '--card-accent': color }}>
      <div className="achievement-card-header">
        <h2>{title}</h2>
      </div>

      <div className="achievement-bests">
        <div className="achievement-best">
          <span className="achievement-best-label">{t('achievements.bestDay')}</span>
          <span className="achievement-best-value">
            {stats.best.value.toFixed(2)} {unit}
          </span>
          <span className="achievement-best-sub">{formatDate(stats.best.date)}</span>
        </div>

        <div className="achievement-best">
          <span className="achievement-best-label">{t('achievements.longestStreak')}</span>
          <span className="achievement-best-value">
            {stats.longestStreak} {t('achievements.daysUnit')}
          </span>
        </div>

        <div className="achievement-best">
          <span className="achievement-best-label">{t('achievements.allTimeAverage')}</span>
          <span className="achievement-best-value">
            {stats.average.toFixed(2)} {unit}
          </span>
          <span className="achievement-best-sub">
            {stats.count} {t('achievements.entriesUnit')}
          </span>
        </div>
      </div>

      <div className="badge-row">
        <div className={`badge ${stats.count >= 1 ? 'badge-unlocked' : 'badge-locked'}`}>
          <span className="badge-icon" aria-hidden="true">🌱</span>
          <span className="badge-label">{t('achievements.firstEntryBadge')}</span>
        </div>

        {STREAK_MILESTONES.map((milestone) => {
          const unlocked = stats.longestStreak >= milestone
          return (
            <div key={milestone} className={`badge ${unlocked ? 'badge-unlocked' : 'badge-locked'}`}>
              <span className="badge-icon" aria-hidden="true">{unlocked ? '🏆' : '🔒'}</span>
              <span className="badge-label">
                {t('achievements.streakBadgeLabel', { days: milestone })}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
