import { NavLink } from 'react-router-dom'
import AvatarMenu from './AvatarMenu'
import { useHiddenMode } from '../lib/HiddenModeContext'
import './Layout.css'

export default function Layout({ children }) {
  const { hidden } = useHiddenMode()

  return (
    <div className="layout">
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>

      <header className="topbar">
        <div className="topbar-inner">
          <div className="brand">
            <div className="phase-dots" aria-hidden="true">
              <span />
              <span />
              <span />
            </div>
            <span className="brand-name">Mein Tracker</span>
          </div>

          <nav className="topnav" aria-label="Main navigation">
            <NavLink to="/dashboard" end>
              Overview
            </NavLink>
            <NavLink to="/sleep">Sleep</NavLink>
            <NavLink to="/water">Water</NavLink>
            <NavLink to="/study">Study</NavLink>
            {hidden && <NavLink to="/personal">हस्तमैथुन</NavLink>}
          </nav>

          <div className="topbar-user">
            <AvatarMenu />
          </div>
        </div>
      </header>

      <main id="main-content" className="layout-content" tabIndex={-1}>
        {children}
      </main>
    </div>
  )
}
