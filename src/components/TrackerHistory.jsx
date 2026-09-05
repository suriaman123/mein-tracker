import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useYearlyStats } from '../lib/useYearlyStats'
import MonthlyTrendChart from './MonthlyTrendChart'
import Layout from './Layout'
import './TrackerHistory.css'

const ACCENT_COLORS = {
  'accent-sleep': '#8FA3F3',
  'accent-water': '#6FCF97',
  'accent-study': '#F2C94C',
  'accent-hidden': '#FF7A00',
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

function formatDate(dateStr) {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('default', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function downloadCsv(logs, valueField, unit, filename) {
  const header = ['Date', `Value (${unit})`, 'Notes']
  const rows = logs.map((l) => [l.log_date, l[valueField], (l.notes || '').replace(/,/g, ';')])
  const csv = [header, ...rows].map((row) => row.join(',')).join('\n')

  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

// table: 'sleep_logs' | 'water_logs' | 'study_logs'
export default function TrackerHistory({ title, table, valueField, unit, accentClass, backPath }) {
  const stats = useYearlyStats(table)
  const navigate = useNavigate()
  const year = new Date().getFullYear()

  const [monthFilter, setMonthFilter] = useState('all')
  const [sortBy, setSortBy] = useState('date_desc')

  const visibleLogs = useMemo(() => {
    let logs = stats.logs

    if (monthFilter !== 'all') {
      logs = logs.filter(
        (l) => new Date(l.log_date + 'T00:00:00').getMonth() === Number(monthFilter)
      )
    }

    const sorted = [...logs]
    switch (sortBy) {
      case 'date_asc':
        sorted.sort((a, b) => a.log_date.localeCompare(b.log_date))
        break
      case 'value_desc':
        sorted.sort((a, b) => Number(b[valueField]) - Number(a[valueField]))
        break
      case 'value_asc':
        sorted.sort((a, b) => Number(a[valueField]) - Number(b[valueField]))
        break
      case 'date_desc':
      default:
        sorted.sort((a, b) => b.log_date.localeCompare(a.log_date))
    }
    return sorted
  }, [stats.logs, monthFilter, sortBy, valueField])

  function handleEdit(entry) {
    navigate(backPath, { state: { prefill: entry } })
  }

  return (
    <Layout>
      <div className="overview-header history-header">
        <div>
          <h1>{title} — {year}</h1>
          <p>
            {stats.count === 0
              ? 'No entries yet this year.'
              : `${stats.count} entries logged in ${year}.`}
          </p>
        </div>
        <div className="history-header-actions">
          <button
            className="history-btn"
            disabled={stats.count === 0}
            onClick={() => downloadCsv(stats.logs, valueField, unit, `${table}_${year}.csv`)}
          >
            Download CSV
          </button>
          <Link to={backPath} className="history-btn history-btn-primary">
            Back to {title}
          </Link>
        </div>
      </div>

      <div className={`tracker-chart-card ${accentClass}`}>
        <h2>Monthly averages</h2>
        {stats.loading ? (
          <p className="tracker-empty">Loading…</p>
        ) : (
          <MonthlyTrendChart
            logs={stats.logs}
            valueField={valueField}
            unit={unit}
            accentColor={ACCENT_COLORS[accentClass]}
          />
        )}
      </div>

      <div className="history-table-card">
        <div className="history-table-header">
          <h2>All entries this year</h2>
          <div className="history-controls">
            <select value={monthFilter} onChange={(e) => setMonthFilter(e.target.value)}>
              <option value="all">All months</option>
              {MONTH_NAMES.map((name, i) => (
                <option key={name} value={i}>{name}</option>
              ))}
            </select>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="date_desc">Date (newest first)</option>
              <option value="date_asc">Date (oldest first)</option>
              <option value="value_desc">{unit} (highest first)</option>
              <option value="value_asc">{unit} (lowest first)</option>
            </select>
          </div>
        </div>

        {stats.loading ? (
          <p className="tracker-empty">Loading…</p>
        ) : stats.logs.length === 0 ? (
          <p className="tracker-empty">Nothing logged yet this year.</p>
        ) : visibleLogs.length === 0 ? (
          <p className="tracker-empty">No entries match that filter.</p>
        ) : (
          <div className="history-table-wrap">
            <table className="history-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>{unit}</th>
                  <th>Notes</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {visibleLogs.map((entry) => (
                  <tr key={entry.id}>
                    <td>{formatDate(entry.log_date)}</td>
                    <td>{Number(entry[valueField]).toFixed(2)}</td>
                    <td className="history-notes-cell">{entry.notes || '—'}</td>
                    <td>
                      <button
                        className="log-action-btn"
                        aria-label={`Edit entry for ${formatDate(entry.log_date)}`}
                        onClick={() => handleEdit(entry)}
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Layout>
  )
}
