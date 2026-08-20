import { useCallback, useEffect, useState } from 'react'
import { supabase } from './supabaseClient'
import { useAuth } from './AuthContext'

function getYearBounds() {
  const year = new Date().getFullYear()
  return { start: `${year}-01-01`, end: `${year + 1}-01-01` }
}

export function useYearlyStats(table) {
  const { user } = useAuth()
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const refresh = useCallback(async () => {
    if (!user) return
    setLoading(true)
    setError('')

    const { start, end } = getYearBounds()

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

  return { logs, count: logs.length, loading, error, refresh }
}
