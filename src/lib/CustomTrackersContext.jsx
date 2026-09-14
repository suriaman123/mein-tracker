import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { useAuth } from './AuthContext'
import { listCustomTrackers } from './customTrackers'

const CustomTrackersContext = createContext(undefined)

export function CustomTrackersProvider({ children }) {
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

  return (
    <CustomTrackersContext.Provider value={{ trackers, loading, refresh }}>
      {children}
    </CustomTrackersContext.Provider>
  )
}

// Same name/shape as the old per-component hook it replaces, so every
// existing call site (Layout, Dashboard, AchievementsSection,
// ManageTrackersSection) keeps working unchanged — they now all share
// one fetch and one refresh, instead of each holding their own stale copy.
export function useCustomTrackers() {
  const ctx = useContext(CustomTrackersContext)
  if (ctx === undefined) {
    throw new Error('useCustomTrackers must be used within a CustomTrackersProvider')
  }
  return ctx
}
