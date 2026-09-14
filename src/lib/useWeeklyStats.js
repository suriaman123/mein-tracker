import { useCallback, useEffect, useState } from 'react'
import { supabase } from './supabaseClient'
import { useAuth } from './AuthContext'

// Sunday-start week, matching the calendar grid's convention.
function getWeekBounds() {
  const now = new Date()
  const start = new Date(now)
  start.setDate(now.getDate() - now.getDay())
  start.setHours(0, 0, 0, 0)

  const end = new Date(start)
  end.setDate(start.getDate() + 7)

  const toISODate = (d) => d.toISOString().slice(0, 10)
  return { start: toISODate(start), end: toISODate(end) }
}

// table: 'sleep_logs' | 'water_logs' | 'study_logs' | 'custom_tracker_logs'
// valueField: 'hours' | 'liters' | 'value'
// extraFilter: optional { column, value } — used by custom trackers
export function useWeeklyStats(table, valueField, extraFilter) {
  const { user } = useAuth()
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const refresh = useCallback(async () => {
    if (!user) return
    setLoading(true)
    setError('')

    const { start, end } = getWeekBounds()

    let query = supabase
      .from(table)
      .select('*')
      .eq('user_id', user.id)
      .gte('log_date', start)
      .lt('log_date', end)

    if (extraFilter) {
      query = query.eq(extraFilter.column, extraFilter.value)
    }

    const { data, error } = await query.order('log_date', { ascending: false })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    setLogs(data)
    setLoading(false)
  }, [table, user, extraFilter?.column, extraFilter?.value])

  useEffect(() => {
    refresh()
  }, [refresh])

  const count = logs.length
  const average = count
    ? logs.reduce((sum, row) => sum + Number(row[valueField]), 0) / count
    : 0

  return { logs, count, average, loading, error, refresh }
}
