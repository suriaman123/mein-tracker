import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../lib/AuthContext'
import { useTheme } from '../lib/ThemeContext'
import { useProfile } from '../lib/useProfile'
import './AvatarMenu.css'

function initialsFor(email) {
  return (email || '?').slice(0, 2).toUpperCase()
}

export default function AvatarMenu() {
  const { user, signOut } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const { profile } = useProfile()
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="avatar-menu" ref={ref}>
      <button className="avatar-trigger" onClick={() => setOpen((o) => !o)}>
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
