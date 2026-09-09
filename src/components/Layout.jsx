import { NavLink } from 'react-router-dom'
import AvatarMenu from './AvatarMenu'
import { useHiddenMode } from '../lib/HiddenModeContext'
import { useLanguage } from '../lib/LanguageContext'
import { useCustomTrackers } from '../lib/useCustomTrackers'
import './Layout.css'

export default function Layout({ children }) {
  const { hidden } = useHiddenMode()
  const { t } = useLanguage()
  const { trackers } = useCustomTrackers()

  return (
    <div className="layout">
      <a href="#main-content" className="skip-link">
        {t('nav.skipToContent')}
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

          <nav className="topnav" aria-label={t('nav.mainNavigation')}>
            <NavLink to="/dashboard" end>
              {t('nav.overview')}
            </NavLink>
            <NavLink to="/sleep">{t('nav.sleep')}</NavLink>
            <NavLink to="/water">{t('nav.water')}</NavLink>
            <NavLink to="/study">{t('nav.study')}</NavLink>
            {trackers.map((tracker) => (
              <NavLink key={tracker.id} to={`/custom/${tracker.id}`}>
                {tracker.name}
              </NavLink>
            ))}
            <NavLink to="/settings" className="topnav-add-link">
              {t('customTrackers.addTrackerNav')}
            </NavLink>
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
