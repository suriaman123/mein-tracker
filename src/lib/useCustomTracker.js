import { useEffect, useState } from 'react'
import { getCustomTracker } from './customTrackers'

export function useCustomTracker(id) {
  const [tracker, setTracker] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError('')

    getCustomTracker(id).then(({ data, error }) => {
      if (cancelled) return
      if (error) setError(error.message)
      setTracker(data)
      setLoading(false)
    })

    return () => {
      cancelled = true
    }
  }, [id])

  return { tracker, loading, error }
}
