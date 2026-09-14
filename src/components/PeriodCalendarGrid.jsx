import { useLanguage } from '../lib/LanguageContext'

const todayStr = () => new Date().toISOString().slice(0, 10)

function formatNumericCellValue(value) {
  return Number.isInteger(value) ? String(value) : value.toFixed(1)
}

// period: 'month' | 'week'
// valueType: 'number' | 'boolean'
export default function PeriodCalendarGrid({
  logs,
  valueField,
  accentColor = '#8FA3F3',
  valueType = 'number',
  period = 'month',
}) {
  const { locale } = useLanguage()
  const isBoolean = valueType === 'boolean'

  const now = new Date()
  const loggedByDate = new Map(logs.map((l) => [l.log_date, l]))

  const toISODate = (d) => d.toISOString().slice(0, 10)

  let cells = []

  if (period === 'week') {
    const weekStart = new Date(now)
    weekStart.setDate(now.getDate() - now.getDay())
    weekStart.setHours(0, 0, 0, 0)

    for (let i = 0; i < 7; i++) {
      const d = new Date(weekStart)
      d.setDate(weekStart.getDate() + i)
      cells.push({ day: d.getDate(), dateStr: toISODate(d) })
    }
  } else {
    const year = now.getFullYear()
    const month = now.getMonth()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const firstWeekday = new Date(year, month, 1).getDay()

    for (let i = 0; i < firstWeekday; i++) {
      cells.push(null)
    }
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
      cells.push({ day, dateStr })
    }
  }

  // Weekday header labels, localized, Sunday-first
  const weekdayLabels = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(2023, 0, 1 + i) // Jan 1 2023 was a Sunday
    return d.toLocaleDateString(locale, { weekday: 'narrow' })
  })

  return (
    <div className="calendar-grid">
      <div className="calendar-grid-weekdays">
        {weekdayLabels.map((label, i) => (
          <span key={i}>{label}</span>
        ))}
      </div>
      <div className={`calendar-grid-days${period === 'week' ? ' calendar-grid-days-week' : ''}`}>
        {cells.map((cell, i) => {
          if (!cell) return <div key={`empty-${i}`} className="calendar-cell calendar-cell-empty" />

          const entry = loggedByDate.get(cell.dateStr)
          const hasEntry = Boolean(entry)
          const isToday = cell.dateStr === todayStr()
          const isYes = hasEntry && Number(entry[valueField]) >= 1

          const cellClass = [
            'calendar-cell',
            isToday && 'calendar-cell-today',
            isBoolean && isYes && 'calendar-cell-checked',
            isBoolean && hasEntry && !isYes && 'calendar-cell-crossed',
            !isBoolean && hasEntry && 'calendar-cell-checked',
          ]
            .filter(Boolean)
            .join(' ')

          return (
            <div
              key={cell.dateStr}
              className={cellClass}
              style={hasEntry ? { '--card-accent': accentColor } : undefined}
            >
              <span className="calendar-cell-day">{cell.day}</span>
              {hasEntry && (
                <span className="calendar-cell-mark" aria-hidden="true">
                  {isBoolean
                    ? isYes
                      ? '✓'
                      : '✗'
                    : formatNumericCellValue(Number(entry[valueField]))}
                </span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
