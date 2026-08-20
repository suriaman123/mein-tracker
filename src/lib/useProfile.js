import { useCallback, useEffect, useState } from 'react'
import { useAuth } from './AuthContext'
import { getProfile } from './profileCrud'

export function useProfile() {
  const { user } = useAuth()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    if (!user) return
    setLoading(true)
    const { data } = await getProfile(user.id)
    setProfile(data)
    setLoading(false)
  }, [user])

  useEffect(() => {
    refresh()
  }, [refresh])

  return { profile, loading, refresh }
}
