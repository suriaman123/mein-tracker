import { createContext, useContext, useMemo, useState } from 'react'
import en from './i18n/en'
import de from './i18n/de'
import hi from './i18n/hi'

const DICTIONARIES = { en, de, hi }

const LOCALES = { en: 'en-US', de: 'de-DE', hi: 'hi-IN' }

export const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'de', label: 'Deutsch' },
  { code: 'hi', label: 'हिन्दी' },
]

const LanguageContext = createContext(undefined)

function getNested(dict, path) {
  return path.split('.').reduce((obj, key) => (obj ? obj[key] : undefined), dict)
}

function interpolate(str, params) {
  if (!params) return str
  return Object.keys(params).reduce(
    (result, key) => result.replaceAll(`{${key}}`, params[key]),
    str
  )
}

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(() => {
    const saved = localStorage.getItem('language')
    return DICTIONARIES[saved] ? saved : 'en'
  })

  function setLanguage(code) {
    if (!DICTIONARIES[code]) return
    localStorage.setItem('language', code)
    setLanguageState(code)
  }

  const t = useMemo(() => {
    return (key, params) => {
      const dict = DICTIONARIES[language]
      let value = getNested(dict, key)

      // Fall back to English if a key is missing in the current language,
      // so a translation gap never shows a blank or a raw key to the user.
      if (value === undefined) {
        value = getNested(en, key)
      }
      if (value === undefined) {
        return key
      }

      return interpolate(value, params)
    }
  }, [language])

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, locale: LOCALES[language] }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const ctx = useContext(LanguageContext)
  if (ctx === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return ctx
}
