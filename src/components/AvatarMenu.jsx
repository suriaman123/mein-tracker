import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../lib/AuthContext'
import { useTheme } from '../lib/ThemeContext'
import { useProfile } from '../lib/useProfile'
import { useHiddenMode } from '../lib/HiddenModeContext'
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
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
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
      <button className="avatar-trigger" onClick={handleAvatarClick}>
        {profile?.avatar_url ? (
          <img src={profile.avatar_url} alt="" className="avatar-img" />
        ) : (
          <span className="avatar-initials">{initialsFor(user?.email)}</span>
        )}
      </button>

      {open && (
        <div className="avatar-dropdown">
          <div className="avatar-dropdown-email">{user?.email}</div>

          <Link to="/profile" className="avatar-dropdown-item" onClick={() => setOpen(false)}>
            Profile
          </Link>

          <button className="avatar-dropdown-item" onClick={toggleTheme}>
            {theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          </button>

          <button
            className="avatar-dropdown-item avatar-dropdown-danger"
            onClick={signOut}
          >
            Log out
          </button>
        </div>
      )}
    </div>
  )
}
