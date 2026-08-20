import { Link } from 'react-router-dom'
import { useYearlyStats } from '../lib/useYearlyStats'
import MonthlyTrendChart from './MonthlyTrendChart'
import Layout from './Layout'
import './TrackerHistory.css'

const ACCENT_COLORS = {
  'accent-sleep': '#8FA3F3',
  'accent-water': '#6FCF97',
  'accent-study': '#F2C94C',
}

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
  const year = new Date().getFullYear()

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
        <h2>All entries this year</h2>
        {stats.loading ? (
          <p className="tracker-empty">Loading…</p>
        ) : stats.logs.length === 0 ? (
          <p className="tracker-empty">Nothing logged yet this year.</p>
        ) : (
          <div className="history-table-wrap">
            <table className="history-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>{unit}</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                {stats.logs.map((entry) => (
                  <tr key={entry.id}>
                    <td>{formatDate(entry.log_date)}</td>
                    <td>{Number(entry[valueField]).toFixed(2)}</td>
                    <td className="history-notes-cell">{entry.notes || '—'}</td>
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
