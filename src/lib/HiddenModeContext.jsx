import { createContext, useContext, useEffect, useState } from 'react'

const HiddenModeContext = createContext(undefined)

export function HiddenModeProvider({ children }) {
  const [hidden, setHidden] = useState(() => {
    return localStorage.getItem('hiddenMode') === 'true'
  })

  useEffect(() => {
    if (hidden) {
      document.documentElement.setAttribute('data-hidden', 'true')
    } else {
      document.documentElement.removeAttribute('data-hidden')
    }
    localStorage.setItem('hiddenMode', String(hidden))
  }, [hidden])

  function toggleHidden() {
    setHidden((h) => !h)
  }

  return (
    <HiddenModeContext.Provider value={{ hidden, toggleHidden }}>
      {children}
    </HiddenModeContext.Provider>
  )
}

export function useHiddenMode() {
  const ctx = useContext(HiddenModeContext)
  if (ctx === undefined) {
    throw new Error('useHiddenMode must be used within a HiddenModeProvider')
  }
  return ctx
}
