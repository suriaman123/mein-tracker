import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/AuthContext'
import { useLanguage } from '../lib/LanguageContext'
import './Auth.css'

export default function Login() {
  const { signIn } = useAuth()
  const { t } = useLanguage()
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSubmitting(true)

    const { error } = await signIn(email, password)

    setSubmitting(false)

    if (error) {
      setError(error.message)
      return
    }

    navigate('/dashboard')
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="phase-dots" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
        <h1>{t('auth.loginTitle')}</h1>
        <p className="auth-subtitle">{t('auth.loginSubtitle')}</p>

        <form className="auth-form" onSubmit={handleSubmit}>
          {error && <div className="auth-error" role="alert">{error}</div>}

          <div className="field">
            <label htmlFor="email">{t('auth.email')}</label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="field">
            <label htmlFor="password">{t('auth.password')}</label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button className="auth-submit" type="submit" disabled={submitting}>
            {submitting ? t('auth.loggingIn') : t('auth.loginButton')}
          </button>
        </form>

        <p className="auth-switch">
          {t('auth.noAccount')} <Link to="/register">{t('auth.registerLink')}</Link>
        </p>
      </div>
    </div>
  )
}
