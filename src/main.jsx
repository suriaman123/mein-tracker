import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import { AuthProvider } from './lib/AuthContext'
import { ThemeProvider } from './lib/ThemeContext'
import { HiddenModeProvider } from './lib/HiddenModeContext'
import { LanguageProvider } from './lib/LanguageContext'
import './index.css'
import App from './App.jsx'

// HashRouter (not BrowserRouter) is used deliberately: GitHub Pages has no
// server to handle client-side routes, so a direct visit or refresh on
// something like /dashboard would 404. HashRouter keeps routes after a "#"
// (e.g. yoursite.github.io/repo/#/dashboard) which GitHub Pages always
// resolves correctly with zero extra config.
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <LanguageProvider>
      <ThemeProvider>
        <HiddenModeProvider>
          <HashRouter>
            <AuthProvider>
              <App />
            </AuthProvider>
          </HashRouter>
        </HiddenModeProvider>
      </ThemeProvider>
    </LanguageProvider>
  </StrictMode>,
)

// Register the service worker (production only) — enables "Add to Home
// Screen" / install prompts and lets the app open (with cached data views)
// even without a connection. Registered with a relative path so it resolves
// correctly whether hosted at a domain root or a GitHub Pages subpath.
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').catch((err) => {
      console.error('Service worker registration failed:', err)
    })
  })
}
