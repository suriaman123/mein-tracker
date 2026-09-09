import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../lib/AuthContext'
import { useTheme } from '../lib/ThemeContext'
import { useProfile } from '../lib/useProfile'
import { useHiddenMode } from '../lib/HiddenModeContext'
import { useLanguage, LANGUAGES } from '../lib/LanguageContext'
import './AvatarMenu.css'

function initialsFor(email) {
  return (email || '?').slice(0, 2).toUpperCase()
}

const TRIPLE_CLICK_WINDOW_MS = 1200

export default function AvatarMenu() {
  const { user, signOut } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const { profile } = useProfile()
  const { toggleHidden } = useHiddenMode()
  const { language, setLanguage, t } = useLanguage()
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  const clickCountRef = useRef(0)
  const clickTimerRef = useRef(null)

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false)
      }
    }
    function handleEscape(e) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [])

  function handleAvatarClick() {
    setOpen((o) => !o)

    clickCountRef.current += 1
    clearTimeout(clickTimerRef.current)

    if (clickCountRef.current >= 3) {
      toggleHidden()
      clickCountRef.current = 0
      return
    }

    clickTimerRef.current = setTimeout(() => {
      clickCountRef.current = 0
    }, TRIPLE_CLICK_WINDOW_MS)
  }

  return (
    <div className="avatar-menu" ref={ref}>
      <button
        className="avatar-trigger"
        onClick={handleAvatarClick}
        aria-label={t('avatarMenu.ariaLabel')}
        aria-haspopup="menu"
        aria-expanded={open}
      >
        {profile?.avatar_url ? (
          <img src={profile.avatar_url} alt="Your profile photo" className="avatar-img" />
        ) : (
          <span className="avatar-initials" aria-hidden="true">
            {initialsFor(user?.email)}
          </span>
        )}
      </button>

      {open && (
        <div className="avatar-dropdown" role="menu">
          <div className="avatar-dropdown-email">{user?.email}</div>

          <Link
            to="/profile"
            className="avatar-dropdown-item"
            role="menuitem"
            onClick={() => setOpen(false)}
          >
            {t('avatarMenu.profile')}
          </Link>

          <Link
            to="/settings"
            className="avatar-dropdown-item"
            role="menuitem"
            onClick={() => setOpen(false)}
          >
            {t('settingsPage.navLabel')}
          </Link>

          <button className="avatar-dropdown-item" role="menuitem" onClick={toggleTheme}>
            {theme === 'dark' ? t('avatarMenu.lightMode') : t('avatarMenu.darkMode')}
          </button>

          <div className="avatar-dropdown-lang" role="menuitem">
            <span className="avatar-dropdown-lang-label">{t('avatarMenu.language')}</span>
            <div className="avatar-dropdown-lang-options">
              {LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  className={`lang-option-btn${language === lang.code ? ' lang-option-active' : ''}`}
                  onClick={() => setLanguage(lang.code)}
                >
                  {lang.label}
                </button>
              ))}
            </div>
          </div>

          <button
            className="avatar-dropdown-item avatar-dropdown-danger"
            role="menuitem"
            onClick={signOut}
          >
            {t('avatarMenu.logout')}
          </button>
        </div>
      )}
    </div>
  )
}
