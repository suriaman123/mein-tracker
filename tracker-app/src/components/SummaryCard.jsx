import { Link } from 'react-router-dom'

export default function SummaryCard({
  title,
  unit,
  average,
  count,
  loading,
  error,
  to,
  accentClass,
}) {
  return (
    <Link to={to} className={`summary-card ${accentClass}`}>
      <div className="summary-card-top">
        <span className="summary-card-title">{title}</span>
        <span className="summary-card-arrow">→</span>
      </div>

      {loading ? (
        <div className="summary-card-loading">Loading…</div>
      ) : error ? (
        <div className="summary-card-error">Couldn't load data</div>
      ) : (
        <>
          <div className="summary-card-average">
            {count === 0 ? '—' : average.toFixed(1)}
            <span className="summary-card-unit">{count === 0 ? '' : unit}</span>
          </div>
          <div className="summary-card-meta">
            {count === 0
              ? 'No entries yet this month'
              : `avg over ${count} ${count === 1 ? 'entry' : 'entries'} this month`}
          </div>
        </>
      )}
    </Link>
  )
}
