import { useCallback, useEffect, useState } from 'react'
import { supabase } from './supabaseClient'
import { useAuth } from './AuthContext'
import { computeLongestStreak } from './useStreak'

// table: 'sleep_logs' | 'water_logs' | 'study_logs' | 'custom_tracker_logs' | 'personal_logs'
// valueField: 'hours' | 'liters' | 'value' | 'count'
// extraFilter: optional { column, value } for custom trackers sharing one table
export function useAllTimeStats(table, valueField, extraFilter) {
  const { user } = useAuth()
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const refresh = useCallback(async () => {
    if (!user) return
    setLoading(true)
    setError('')

    let query = supabase.from(table).select('*').eq('user_id', user.id)

    if (extraFilter) {
      query = query.eq(extraFilter.column, extraFilter.value)
    }

    const { data, error } = await query.order('log_date', { ascending: true })

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

  const best = logs.reduce((acc, row) => {
    const value = Number(row[valueField])
    if (!acc || value > acc.value) {
      return { value, date: row.log_date }
    }
    return acc
  }, null)

  const longestStreak = computeLongestStreak(logs.map((l) => l.log_date))

  return { logs, count, average, best, longestStreak, loading, error, refresh }
}
