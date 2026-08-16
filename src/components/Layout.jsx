import { NavLink } from 'react-router-dom'
import { useAuth } from '../lib/AuthContext'
import './Layout.css'

export default function Layout({ children }) {
  const { user, signOut } = useAuth()

  return (
    <div className="layout">
      <header className="topbar">
        <div className="topbar-inner">
          <div className="brand">
            <div className="phase-dots">
              <span />
              <span />
              <span />
            </div>
            <span className="brand-name">Mein Tracker</span>
          </div>

          <nav className="topnav">
            <NavLink to="/dashboard" end>
              Overview
            </NavLink>
            <NavLink to="/sleep">Sleep</NavLink>
            <NavLink to="/water">Water</NavLink>
            <NavLink to="/study">Study</NavLink>
          </nav>

          <div className="topbar-user">
            <span className="user-email">{user?.email}</span>
            <button className="signout-btn" onClick={signOut}>
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="layout-content">{children}</main>
    </div>
  )
}
