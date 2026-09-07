import { useCallback, useEffect, useState } from 'react'
import { useAuth } from './AuthContext'
import { listCustomTrackers } from './customTrackers'

export function useCustomTrackers() {
  const { user } = useAuth()
  const [trackers, setTrackers] = useState([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    if (!user) return
    setLoading(true)
    const { data } = await listCustomTrackers(user.id)
    setTrackers(data)
    setLoading(false)
  }, [user])

  useEffect(() => {
    refresh()
  }, [refresh])

  return { trackers, loading, refresh }
}
