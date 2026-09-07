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

// Finds the longest run of consecutive days anywhere in history — used
// for "longest streak ever" on the Achievements page, distinct from the
// "current active streak" above.
export function computeLongestStreak(dateStrings) {
  if (dateStrings.length === 0) return 0

  const sortedDates = [...new Set(dateStrings)].sort()
  let longest = 1
  let current = 1

  for (let i = 1; i < sortedDates.length; i++) {
    const prev = new Date(sortedDates[i - 1] + 'T00:00:00')
    const curr = new Date(sortedDates[i] + 'T00:00:00')
    const dayDiff = Math.round((curr - prev) / (1000 * 60 * 60 * 24))

    if (dayDiff === 1) {
      current += 1
      longest = Math.max(longest, current)
    } else {
      current = 1
    }
  }

  return longest
}

export function useStreak(table, extraFilter) {
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

    let query = supabase
      .from(table)
      .select('log_date')
      .eq('user_id', user.id)
      .gte('log_date', toISODate(cutoff))

    if (extraFilter) {
      query = query.eq(extraFilter.column, extraFilter.value)
    }

    const { data, error } = await query

    if (!error && data) {
      setStreak(computeStreak(data.map((r) => r.log_date)))
    }
    setLoading(false)
  }, [table, user, extraFilter?.column, extraFilter?.value])

  useEffect(() => {
    refresh()
  }, [refresh])

  return { streak, loading, refresh }
}
