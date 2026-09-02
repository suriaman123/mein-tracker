import { useCallback, useEffect, useState } from 'react'
import { supabase } from './supabaseClient'
import { useAuth } from './AuthContext'

const toISODate = (d) => d.toISOString().slice(0, 10)

// Counts consecutive logged days ending today (or yesterday, if today
// hasn't been logged yet — the streak is still considered "alive" until
// the day actually ends).
function computeStreak(dateStrings) {
  const dateSet = new Set(dateStrings)
  const cursor = new Date()
  cursor.setHours(0, 0, 0, 0)

  if (!dateSet.has(toISODate(cursor))) {
    cursor.setDate(cursor.getDate() - 1)
  }

  let streak = 0
  while (dateSet.has(toISODate(cursor))) {
    streak += 1
    cursor.setDate(cursor.getDate() - 1)
  }

  return streak
}

export function useStreak(table) {
  const { user } = useAuth()
  const [streak, setStreak] = useState(0)
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    if (!user) return
    setLoading(true)

    // Only the last ~60 days are needed to determine a streak — no point
    // pulling the user's entire history just for this.
    const cutoff = new Date()
    cutoff.setDate(cutoff.getDate() - 60)

    const { data, error } = await supabase
      .from(table)
      .select('log_date')
      .eq('user_id', user.id)
      .gte('log_date', toISODate(cutoff))

    if (!error && data) {
      setStreak(computeStreak(data.map((r) => r.log_date)))
    }
    setLoading(false)
  }, [table, user])

  useEffect(() => {
    refresh()
  }, [refresh])

  return { streak, loading, refresh }
}
