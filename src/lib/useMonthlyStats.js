import { useEffect, useState, useCallback } from 'react'
import { supabase } from './supabaseClient'
import { useAuth } from './AuthContext'

// Returns YYYY-MM-01 and the first day of next month, for filtering
// "this calendar month" regardless of how many days it has.
function getMonthBounds() {
  const now = new Date()
  const start = new Date(now.getFullYear(), now.getMonth(), 1)
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 1)
  const toISODate = (d) => d.toISOString().slice(0, 10)
  return { start: toISODate(start), end: toISODate(end) }
}

// table: 'sleep_logs' | 'water_logs' | 'study_logs'
// valueField: 'hours' | 'liters'
export function useMonthlyStats(table, valueField) {
  const { user } = useAuth()
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const refresh = useCallback(async () => {
    if (!user) return
    setLoading(true)
    setError('')

    const { start, end } = getMonthBounds()

    const { data, error } = await supabase
      .from(table)
      .select('*')
      .eq('user_id', user.id)
      .gte('log_date', start)
      .lt('log_date', end)
      .order('log_date', { ascending: false })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    setLogs(data)
    setLoading(false)
  }, [table, user])

  useEffect(() => {
    refresh()
  }, [refresh])

  const count = logs.length
  const average = count
    ? logs.reduce((sum, row) => sum + Number(row[valueField]), 0) / count
    : 0

  return { logs, count, average, loading, error, refresh }
}
