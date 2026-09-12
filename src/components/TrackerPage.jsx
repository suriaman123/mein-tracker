import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/AuthContext'
import { useMonthlyStats } from '../lib/useMonthlyStats'
import { useStreak } from '../lib/useStreak'
import { useProfile } from '../lib/useProfile'
import { useLanguage } from '../lib/LanguageContext'
import { useConfirm } from '../lib/ConfirmContext'
import { saveLog, deleteLog } from '../lib/trackerCrud'
import { CUSTOM_COLOR_PRESETS } from '../lib/colorPresets'
import TrendChart from './TrendChart'
import MonthCalendarGrid from './MonthCalendarGrid'
import Layout from './Layout'
import './TrackerPage.css'
import './TrackerHistory.css'

const today = () => new Date().toISOString().slice(0, 10)

const ACCENT_COLORS = {
  'accent-sleep': '#8FA3F3',
  'accent-water': '#6FCF97',
  'accent-study': '#F2C94C',
  'accent-hidden': '#FF7A00',
  ...Object.fromEntries(CUSTOM_COLOR_PRESETS.map((c) => [`accent-${c.key}`, c.hex])),
}

// table: 'sleep_logs' | 'water_logs' | 'study_logs' | 'custom_tracker_logs'
// valueField: 'hours' | 'liters' | 'value'
export default function TrackerPage({
  title,
  table,
  valueField,
  unit,
  accentClass,
  min = 0,
  max = 24,
  step = 0.25,
  valueLabel,
  historyPath,
  quickAddSteps: defaultQuickAddSteps = [],
  quickAddKey,
  extraFilter,
  extraInsertFields,
  conflictTarget,
  valueType = 'number',
  booleanQuestion,
}) {
  const { user } = useAuth()
  const stats = useMonthlyStats(table, valueField, extraFilter)
  const streakInfo = useStreak(table, extraFilter)
  const { profile } = useProfile()
  const { t, locale } = useLanguage()
  const confirm = useConfirm()
  const location = useLocation()
  const navigate = useNavigate()
  const isBoolean = valueType === 'boolean'

  function formatDate(dateStr) {
    return new Date(dateStr + 'T00:00:00').toLocaleDateString(locale, {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    })
  }

  const quickAddSteps =
    (quickAddKey && profile?.quick_add_steps?.[quickAddKey]) || defaultQuickAddSteps

  const [logDate, setLogDate] = useState(today())
  const [value, setValue] = useState('')
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [deletingId, setDeletingId] = useState(null)
  const [savedMessage, setSavedMessage] = useState('')
  const [quickAdding, setQuickAdding] = useState(null)
  const [trendView, setTrendView] = useState(isBoolean ? 'calendar' : 'chart')

  // If we arrived here via the "Edit" button on the yearly history table,
  // prefill the form with that entry — works for any month, not just this one.
  useEffect(() => {
    const prefill = location.state?.prefill
    if (prefill) {
      setLogDate(prefill.log_date)
      setValue(String(prefill[valueField]))
      setNotes(prefill.notes || '')
      window.scrollTo({ top: 0, behavior: 'smooth' })
      // Clear the navigation state so refreshing this page doesn't re-trigger it
      navigate(location.pathname, { replace: true, state: {} })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state])

  function loadEntryIntoForm(entry) {
    setLogDate(entry.log_date)
    setValue(String(entry[valueField]))
    setNotes(entry.notes || '')
    setError('')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function resetForm() {
    setLogDate(today())
    setValue('')
    setNotes('')
    setError('')
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    let numericValue
    if (isBoolean) {
      numericValue = value === '1' ? 1 : 0
    } else {
      numericValue = parseFloat(value)
      if (Number.isNaN(numericValue) || numericValue < min || numericValue > max) {
        setError(t('tracker.valueRangeError', { min, max }))
        return
      }
    }

    setSaving(true)
    const { error } = await saveLog(table, {
      userId: user.id,
      logDate,
      valueField,
      value: numericValue,
      notes,
      extraFields: extraInsertFields,
      conflictTarget,
    })
    setSaving(false)

    if (error) {
      setError(error.message)
      return
    }

    const savedDateLabel = formatDate(logDate)
    resetForm()
    stats.refresh()
    streakInfo.refresh()

    setSavedMessage(
      t('tracker.savedFor', { date: savedDateLabel }) +
        (logDate.slice(0, 7) !== today().slice(0, 7) ? t('tracker.savedOutsideMonth') : '')
    )
    setTimeout(() => setSavedMessage(''), 5000)
  }

  async function handleQuickAdd(step) {
    setError('')
    setQuickAdding(step)

    const todayStr = today()
    const existing = stats.logs.find((l) => l.log_date === todayStr)
    const currentValue = existing ? Number(existing[valueField]) : 0
    const newValue = Math.min(max, currentValue + step)

    const { error } = await saveLog(table, {
      userId: user.id,
      logDate: todayStr,
      valueField,
      value: newValue,
      notes: existing?.notes || '',
      extraFields: extraInsertFields,
      conflictTarget,
    })

    setQuickAdding(null)

    if (error) {
      setError(error.message)
      return
    }

    stats.refresh()
    streakInfo.refresh()
    setSavedMessage(
      t('tracker.quickAddedTotal', { step, unit, total: newValue.toFixed(2) })
    )
    setTimeout(() => setSavedMessage(''), 5000)
  }

  async function handleBooleanQuickToggle() {
    setError('')
    setQuickAdding('boolean-toggle')

    const todayStr = today()
    const existing = stats.logs.find((l) => l.log_date === todayStr)
    const currentlyMarked = existing && Number(existing[valueField]) >= 1
    const newValue = currentlyMarked ? 0 : 1

    const { error } = await saveLog(table, {
      userId: user.id,
      logDate: todayStr,
      valueField,
      value: newValue,
      notes: existing?.notes || '',
      extraFields: extraInsertFields,
      conflictTarget,
    })

    setQuickAdding(null)

    if (error) {
      setError(error.message)
      return
    }

    stats.refresh()
    streakInfo.refresh()
    setSavedMessage(
      currentlyMarked ? t('booleanQuickAdd.unmarkedMsg') : t('booleanQuickAdd.markedMsg')
    )
    setTimeout(() => setSavedMessage(''), 5000)
  }

  async function handleDelete(id, dateLabel) {
    const confirmed = await confirm(t('tracker.deleteConfirm', { date: dateLabel }))
    if (!confirmed) return

    setDeletingId(id)
    const { error } = await deleteLog(table, id)
    setDeletingId(null)

    if (error) {
      setError(error.message)
      return
    }
    stats.refresh()
    streakInfo.refresh()
  }

  const existingEntryForDate = stats.logs.find((l) => l.log_date === logDate)
  const todayEntry = stats.logs.find((l) => l.log_date === today())
  const todayMarked = todayEntry && Number(todayEntry[valueField]) >= 1

  return (
    <Layout>
      <div className="overview-header history-header">
        <div>
          <h1>{title}</h1>
          <p>
            {stats.count === 0
              ? t('tracker.noEntriesMonth')
              : t(stats.count === 1 ? 'tracker.monthAverageOne' : 'tracker.monthAverageMany', {
                  avg: isBoolean ? (stats.average * 100).toFixed(0) : stats.average.toFixed(1),
                  unit: isBoolean ? '%' : unit,
                  count: stats.count,
                })}
            {streakInfo.streak > 0 && t('tracker.streakSuffix', { count: streakInfo.streak })}
          </p>
        </div>
        {historyPath && (
          <Link to={historyPath} className="history-btn">
            {t('tracker.seeAllData')}
          </Link>
        )}
      </div>

      <div className={`tracker-layout ${accentClass}`}>
        <div className="tracker-form-col">
          {isBoolean && (
            <div className="quick-add-row">
              <button
                type="button"
                className={`quick-add-btn boolean-toggle-btn${todayMarked ? ' boolean-toggle-active' : ''}`}
                disabled={quickAdding !== null}
                onClick={handleBooleanQuickToggle}
              >
                {quickAdding === 'boolean-toggle'
                  ? '…'
                  : todayMarked
                    ? t('booleanQuickAdd.markedToday')
                    : t('booleanQuickAdd.markToday')}
              </button>
            </div>
          )}

          {quickAddSteps.length > 0 && (
            <div className="quick-add-row">
              <span className="quick-add-label">{t('tracker.quickAddLabel')}</span>
              <div className="quick-add-buttons">
                {quickAddSteps.map((step) => (
                  <button
                    key={step}
                    type="button"
                    className="quick-add-btn"
                    disabled={quickAdding !== null}
                    onClick={() => handleQuickAdd(step)}
                  >
                    {quickAdding === step ? '…' : `+${step} ${unit}`}
                  </button>
                ))}
              </div>
            </div>
          )}

          <form className="tracker-form" onSubmit={handleSubmit}>
          <h2>{existingEntryForDate ? t('tracker.editEntry') : t('tracker.logEntry')}</h2>

          {error && <div className="auth-error" role="alert">{error}</div>}
          {savedMessage && <div className="auth-success" role="status" aria-live="polite">{savedMessage}</div>}
          {existingEntryForDate && (
            <div className="tracker-form-notice">
              {t('tracker.alreadyLogged')}
            </div>
          )}

          <div className="field">
            <label htmlFor="logDate">{t('tracker.dateLabel')}</label>
            <input
              id="logDate"
              type="date"
              max={today()}
              required
              value={logDate}
              onChange={(e) => setLogDate(e.target.value)}
            />
          </div>

          {isBoolean ? (
            <div className="field field-checkbox">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={value === '1'}
                  onChange={(e) => setValue(e.target.checked ? '1' : '0')}
                />
                {booleanQuestion || t('trackerExtra.booleanQuestion')}
              </label>
            </div>
          ) : (
            <div className="field">
              <label htmlFor="value">{valueLabel}</label>
              <input
                id="value"
                type="number"
                min={min}
                max={max}
                step={step}
                required
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder={`e.g. ${((min + max) / 4).toFixed(1)}`}
              />
            </div>
          )}

          <div className="field">
            <label htmlFor="notes">{t('tracker.notesLabel')}</label>
            <input
              id="notes"
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={t('tracker.notesPlaceholder')}
            />
          </div>

          <button className="auth-submit" type="submit" disabled={saving}>
            {saving ? t('tracker.savingEntry') : existingEntryForDate ? t('tracker.updateEntry') : t('tracker.saveEntry')}
          </button>
        </form>
        </div>

        <div className="tracker-right-col">
          <div className="tracker-chart-card">
            <div className="tracker-chart-card-header">
              <h2>{t('tracker.thisMonthsTrend')}</h2>
              {isBoolean && (
                <div className="chart-view-toggle">
                  <button
                    type="button"
                    className={`chart-view-btn${trendView === 'calendar' ? ' chart-view-active' : ''}`}
                    onClick={() => setTrendView('calendar')}
                  >
                    {t('trackerExtra2.viewAsCalendar')}
                  </button>
                  <button
                    type="button"
                    className={`chart-view-btn${trendView === 'chart' ? ' chart-view-active' : ''}`}
                    onClick={() => setTrendView('chart')}
                  >
                    {t('trackerExtra2.viewAsChart')}
                  </button>
                </div>
              )}
            </div>
            {isBoolean && trendView === 'calendar' ? (
              <MonthCalendarGrid
                logs={stats.logs}
                valueField={valueField}
                accentColor={ACCENT_COLORS[accentClass]}
              />
            ) : (
              <TrendChart
                logs={stats.logs}
                valueField={valueField}
                unit={unit}
                accentColor={ACCENT_COLORS[accentClass]}
                emptyLabel={t('tracker.logForTrend')}
              />
            )}
          </div>

          <div className="tracker-list">
            <h2>{t('tracker.entriesHeading')}</h2>

            {stats.loading ? (
              <p className="tracker-empty">{t('tracker.loading')}</p>
            ) : stats.logs.length === 0 ? (
              <p className="tracker-empty">{t('tracker.nothingLogged')}</p>
            ) : (
              <ul className="log-list">
                {stats.logs.map((entry) => (
                  <li key={entry.id} className="log-row">
                    <div className="log-row-main">
                      <span className="log-date">{formatDate(entry.log_date)}</span>
                      <span className="log-value">
                        {isBoolean
                          ? Number(entry[valueField]) >= 1
                            ? t('common2.yes')
                            : t('common2.no')
                          : `${Number(entry[valueField]).toFixed(2)} ${unit}`}
                      </span>
                    </div>
                    {entry.notes && <div className="log-notes">{entry.notes}</div>}
                    <div className="log-row-actions">
                      <button
                        type="button"
                        className="log-action-btn"
                        aria-label={t('tracker.editAriaLabel', { date: formatDate(entry.log_date) })}
                        onClick={() => loadEntryIntoForm(entry)}
                      >
                        {t('tracker.editButton')}
                      </button>
                      <button
                        type="button"
                        className="log-action-btn log-action-danger"
                        aria-label={t('tracker.deleteAriaLabel', { date: formatDate(entry.log_date) })}
                        disabled={deletingId === entry.id}
                        onClick={() => handleDelete(entry.id, formatDate(entry.log_date))}
                      >
                        {deletingId === entry.id ? t('tracker.deletingButton') : t('tracker.deleteButton')}
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </Layout>
  )
}
