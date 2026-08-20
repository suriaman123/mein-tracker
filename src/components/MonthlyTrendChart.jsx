import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts'

function cssVar(name, fallback) {
  if (typeof window === 'undefined') return fallback
  const value = getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim()
  return value || fallback
}

const MONTH_LABELS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
]

function CustomTooltip({ active, payload, unit }) {
  if (!active || !payload?.length) return null
  const point = payload[0].payload
  if (point.count === 0) return null
  return (
    <div className="chart-tooltip">
      <div className="chart-tooltip-date">{point.month}</div>
      <div className="chart-tooltip-value">
        {point.average.toFixed(2)} {unit} avg · {point.count} {point.count === 1 ? 'entry' : 'entries'}
      </div>
    </div>
  )
}

// logs: all of this year's entries (any month). Groups them by month
// and computes each month's average.
export default function MonthlyTrendChart({ logs, valueField, unit, accentColor = '#8FA3F3' }) {
  const byMonth = Array.from({ length: 12 }, (_, i) => ({
    month: MONTH_LABELS[i],
    values: [],
  }))

  logs.forEach((entry) => {
    const monthIndex = new Date(entry.log_date + 'T00:00:00').getMonth()
    byMonth[monthIndex].values.push(Number(entry[valueField]))
  })

  const data = byMonth.map(({ month, values }) => ({
    month,
    average: values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0,
    count: values.length,
  }))

  const gridColor = cssVar('--border', '#34395F')
  const textColor = cssVar('--text-muted', '#9498B3')

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
        <XAxis
          dataKey="month"
          tick={{ fill: textColor, fontSize: 12 }}
          axisLine={{ stroke: gridColor }}
          tickLine={false}
        />
        <YAxis
          tick={{ fill: textColor, fontSize: 12 }}
          axisLine={false}
          tickLine={false}
          width={32}
        />
        <Tooltip
          content={<CustomTooltip unit={unit} />}
          cursor={{ fill: 'rgba(255,255,255,0.04)' }}
        />
        <Bar dataKey="average" fill={accentColor} radius={[4, 4, 0, 0]} maxBarSize={36} />
      </BarChart>
    </ResponsiveContainer>
  )
}
