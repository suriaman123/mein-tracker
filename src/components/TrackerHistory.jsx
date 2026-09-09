import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useYearlyStats } from '../lib/useYearlyStats'
import { useLanguage } from '../lib/LanguageContext'
import { CUSTOM_COLOR_PRESETS } from '../lib/colorPresets'
import MonthlyTrendChart from './MonthlyTrendChart'
import Layout from './Layout'
import './TrackerHistory.css'

const ACCENT_COLORS = {
  'accent-sleep': '#8FA3F3',
  'accent-water': '#6FCF97',
  'accent-study': '#F2C94C',
  'accent-hidden': '#FF7A00',
  ...Object.fromEntries(CUSTOM_COLOR_PRESETS.map((c) => [`accent-${c.key}`, c.hex])),
}

function getMonthNames(locale, format = 'long') {
  return Array.from({ length: 12 }, (_, i) =>
    new Date(2000, i, 1).toLocaleDateString(locale, { month: format })
  )
}

// table: 'sleep_logs' | 'water_logs' | 'study_logs'
export default function TrackerHistory({ title, table, valueField, unit, accentClass, backPath, extraFilter, valueType = 'number' }) {
  const stats = useYearlyStats(table, extraFilter)
  const navigate = useNavigate()
  const { t, locale } = useLanguage()
  const isBoolean = valueType === 'boolean'
  const year = new Date().getFullYear()
  const monthNames = getMonthNames(locale, 'long')
  const monthNamesShort = getMonthNames(locale, 'short')

  function formatValue(entry) {
    if (isBoolean) {
      return Number(entry[valueField]) >= 1 ? t('common2.yes') : t('common2.no')
    }
    return Number(entry[valueField]).toFixed(2)
  }

  function formatDate(dateStr) {
    return new Date(dateStr + 'T00:00:00').toLocaleDateString(locale, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  function downloadCsv(logs, filename) {
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
              ? t('trackerHistory.noEntriesYear')
              : t('trackerHistory.entriesThisYear', { count: stats.count, year })}
          </p>
        </div>
        <div className="history-header-actions">
          <button
            className="history-btn"
            disabled={stats.count === 0}
            onClick={() => downloadCsv(stats.logs, `${table}_${year}.csv`)}
          >
            {t('trackerHistory.downloadCsv')}
          </button>
          <Link to={backPath} className="history-btn history-btn-primary">
            {t('trackerHistory.backTo', { title })}
          </Link>
        </div>
      </div>

      <div className={`tracker-chart-card ${accentClass}`}>
        <h2>{t('trackerHistory.monthlyAverages')}</h2>
        {stats.loading ? (
          <p className="tracker-empty">{t('trackerHistory.loading')}</p>
        ) : (
          <MonthlyTrendChart
            logs={stats.logs}
            valueField={valueField}
            unit={unit}
            accentColor={ACCENT_COLORS[accentClass]}
            monthNames={monthNamesShort}
            avgLabel={t('chart.avg')}
            entryWord={t('chart.entry')}
            entriesWord={t('chart.entries')}
          />
        )}
      </div>

      <div className="history-table-card">
        <div className="history-table-header">
          <h2>{t('trackerHistory.allEntriesThisYear')}</h2>
          <div className="history-controls">
            <select value={monthFilter} onChange={(e) => setMonthFilter(e.target.value)}>
              <option value="all">{t('trackerHistory.allMonths')}</option>
              {monthNames.map((name, i) => (
                <option key={name} value={i}>{name}</option>
              ))}
            </select>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="date_desc">{t('trackerHistory.dateNewest')}</option>
              <option value="date_asc">{t('trackerHistory.dateOldest')}</option>
              <option value="value_desc">{t('trackerHistory.valueHighest', { unit })}</option>
              <option value="value_asc">{t('trackerHistory.valueLowest', { unit })}</option>
            </select>
          </div>
        </div>

        {stats.loading ? (
          <p className="tracker-empty">{t('trackerHistory.loading')}</p>
        ) : stats.logs.length === 0 ? (
          <p className="tracker-empty">{t('trackerHistory.noEntriesYear')}</p>
        ) : visibleLogs.length === 0 ? (
          <p className="tracker-empty">{t('trackerHistory.noEntriesMatch')}</p>
        ) : (
          <div className="history-table-wrap">
            <table className="history-table">
              <thead>
                <tr>
                  <th>{t('trackerHistory.colDate')}</th>
                  <th>{isBoolean ? t('trackerExtra.valueTypeBoolean') : unit}</th>
                  <th>{t('trackerHistory.colNotes')}</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {visibleLogs.map((entry) => (
                  <tr key={entry.id}>
                    <td>{formatDate(entry.log_date)}</td>
                    <td>{formatValue(entry)}</td>
                    <td className="history-notes-cell">{entry.notes || '—'}</td>
                    <td>
                      <button
                        className="log-action-btn"
                        aria-label={t('tracker.editAriaLabel', { date: formatDate(entry.log_date) })}
                        onClick={() => handleEdit(entry)}
                      >
                        {t('tracker.editButton')}
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
