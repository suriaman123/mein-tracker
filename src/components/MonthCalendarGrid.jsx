import { useLanguage } from '../lib/LanguageContext'

const todayStr = () => new Date().toISOString().slice(0, 10)

export default function MonthCalendarGrid({ logs, valueField, accentColor = '#8FA3F3' }) {
  const { locale } = useLanguage()

  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const firstWeekday = new Date(year, month, 1).getDay() // 0 = Sunday

  const loggedByDate = new Map(logs.map((l) => [l.log_date, Number(l[valueField]) >= 1]))

  // Weekday header labels, localized, Sunday-first
  const weekdayLabels = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(2023, 0, 1 + i) // Jan 1 2023 was a Sunday
    return d.toLocaleDateString(locale, { weekday: 'narrow' })
  })

  const cells = []
  for (let i = 0; i < firstWeekday; i++) {
    cells.push(null)
  }
  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    cells.push({ day, dateStr })
  }

  return (
    <div className="calendar-grid">
      <div className="calendar-grid-weekdays">
        {weekdayLabels.map((label, i) => (
          <span key={i}>{label}</span>
        ))}
      </div>
      <div className="calendar-grid-days">
        {cells.map((cell, i) => {
          if (!cell) return <div key={`empty-${i}`} className="calendar-cell calendar-cell-empty" />

          const isLogged = loggedByDate.get(cell.dateStr)
          const hasEntry = loggedByDate.has(cell.dateStr)
          const isToday = cell.dateStr === todayStr()

          return (
            <div
              key={cell.dateStr}
              className={`calendar-cell${isToday ? ' calendar-cell-today' : ''}${isLogged ? ' calendar-cell-checked' : ''}`}
              style={isLogged ? { '--card-accent': accentColor } : undefined}
            >
              <span className="calendar-cell-day">{cell.day}</span>
              {hasEntry && (
                <span className="calendar-cell-mark" aria-hidden="true">
                  {isLogged ? '✓' : '·'}
                </span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
