import { useState } from 'react'
import { useAuth } from '../lib/AuthContext'
import { useMonthlyStats } from '../lib/useMonthlyStats'
import { saveLog, deleteLog } from '../lib/trackerCrud'
import TrendChart from './TrendChart'
import Layout from './Layout'
import './TrackerPage.css'

const today = () => new Date().toISOString().slice(0, 10)

const ACCENT_COLORS = {
  'accent-sleep': '#8FA3F3',
  'accent-water': '#6FCF97',
  'accent-study': '#F2C94C',
}

function formatDate(dateStr) {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('default', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })
}

// table: 'sleep_logs' | 'water_logs' | 'study_logs'
// valueField: 'hours' | 'liters'
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
}) {
  const { user } = useAuth()
  const stats = useMonthlyStats(table, valueField)

  const [logDate, setLogDate] = useState(today())
  const [value, setValue] = useState('')
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [deletingId, setDeletingId] = useState(null)

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

    const numericValue = parseFloat(value)
    if (Number.isNaN(numericValue) || numericValue < min || numericValue > max) {
      setError(`Enter a value between ${min} and ${max}.`)
      return
    }

    setSaving(true)
    const { error } = await saveLog(table, {
      userId: user.id,
      logDate,
      valueField,
      value: numericValue,
      notes,
    })
    setSaving(false)

    if (error) {
      setError(error.message)
      return
    }

    resetForm()
    stats.refresh()
  }

  async function handleDelete(id) {
    setDeletingId(id)
    const { error } = await deleteLog(table, id)
    setDeletingId(null)

    if (error) {
      setError(error.message)
      return
    }
    stats.refresh()
  }

  const existingEntryForDate = stats.logs.find((l) => l.log_date === logDate)

  return (
    <Layout>
      <div className="overview-header">
        <h1>{title}</h1>
        <p>
          {stats.count === 0
            ? 'No entries yet this month.'
            : `This month's average: ${stats.average.toFixed(1)} ${unit} over ${stats.count} ${stats.count === 1 ? 'entry' : 'entries'}.`}
        </p>
      </div>

      <div className={`tracker-layout ${accentClass}`}>
        <form className="tracker-form" onSubmit={handleSubmit}>
          <h2>{existingEntryForDate ? 'Edit entry' : 'Log an entry'}</h2>

          {error && <div className="auth-error">{error}</div>}
          {existingEntryForDate && (
            <div className="tracker-form-notice">
              You already have an entry for this date — saving will update it.
            </div>
          )}

          <div className="field">
            <label htmlFor="logDate">Date</label>
            <input
              id="logDate"
              type="date"
              max={today()}
              required
              value={logDate}
              onChange={(e) => setLogDate(e.target.value)}
            />
          </div>

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

          <div className="field">
            <label htmlFor="notes">Notes (optional)</label>
            <input
              id="notes"
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Anything worth remembering about this day"
            />
          </div>

          <button className="auth-submit" type="submit" disabled={saving}>
            {saving ? 'Saving…' : existingEntryForDate ? 'Update entry' : 'Save entry'}
          </button>
        </form>

        <div className="tracker-right-col">
          <div className="tracker-chart-card">
            <h2>This month's trend</h2>
            <TrendChart
              logs={stats.logs}
              valueField={valueField}
              unit={unit}
              accentColor={ACCENT_COLORS[accentClass]}
            />
          </div>

          <div className="tracker-list">
            <h2>Entries</h2>

            {stats.loading ? (
              <p className="tracker-empty">Loading…</p>
            ) : stats.logs.length === 0 ? (
              <p className="tracker-empty">Nothing logged yet — add your first entry.</p>
            ) : (
              <ul className="log-list">
                {stats.logs.map((entry) => (
                  <li key={entry.id} className="log-row">
                    <div className="log-row-main">
                      <span className="log-date">{formatDate(entry.log_date)}</span>
                      <span className="log-value">
                        {Number(entry[valueField]).toFixed(2)} {unit}
                      </span>
                    </div>
                    {entry.notes && <div className="log-notes">{entry.notes}</div>}
                    <div className="log-row-actions">
                      <button
                        type="button"
                        className="log-action-btn"
                        onClick={() => loadEntryIntoForm(entry)}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="log-action-btn log-action-danger"
                        disabled={deletingId === entry.id}
                        onClick={() => handleDelete(entry.id)}
                      >
                        {deletingId === entry.id ? 'Deleting…' : 'Delete'}
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
