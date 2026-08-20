import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts'

// Resolves a CSS variable to its actual value so recharts (which needs
// real color strings, not var(--x)) can use it.
function cssVar(name, fallback) {
  if (typeof window === 'undefined') return fallback
  const value = getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim()
  return value || fallback
}

function CustomTooltip({ active, payload, unit }) {
  if (!active || !payload?.length) return null
  const point = payload[0].payload
  return (
    <div className="chart-tooltip">
      <div className="chart-tooltip-date">{point.label}</div>
      <div className="chart-tooltip-value">
        {point.value.toFixed(2)} {unit}
      </div>
    </div>
  )
}

export default function TrendChart({ logs, valueField, unit, accentColor = '#8FA3F3' }) {
  if (logs.length === 0) {
    return <p className="tracker-empty">Log a few entries to see your trend here.</p>
  }

  // logs come sorted newest-first from useMonthlyStats; chart wants oldest-first
  const data = [...logs]
    .sort((a, b) => a.log_date.localeCompare(b.log_date))
    .map((entry) => ({
      day: new Date(entry.log_date + 'T00:00:00').getDate(),
      label: new Date(entry.log_date + 'T00:00:00').toLocaleDateString('default', {
        month: 'short',
        day: 'numeric',
      }),
      value: Number(entry[valueField]),
    }))

  const gridColor = cssVar('--border', '#34395F')
  const textColor = cssVar('--text-muted', '#9498B3')

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
        <XAxis
          dataKey="day"
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
        <Bar dataKey="value" fill={accentColor} radius={[4, 4, 0, 0]} maxBarSize={28} />
      </BarChart>
    </ResponsiveContainer>
  )
}
