import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'

// HashRouter (not BrowserRouter) is used deliberately: GitHub Pages has no
// server to handle client-side routes, so a direct visit or refresh on
// something like /dashboard would 404. HashRouter keeps routes after a "#"
// (e.g. yoursite.github.io/repo/#/dashboard) which GitHub Pages always
// resolves correctly with zero extra config.
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <HashRouter>
      <App />
    </HashRouter>
  </StrictMode>,
)
