import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../lib/AuthContext'
import { useLanguage } from '../lib/LanguageContext'
import './Auth.css'

export default function Register() {
  const { signUp } = useAuth()
  const { t } = useLanguage()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError(t('auth.passwordsDontMatch'))
      return
    }

    if (password.length < 6) {
      setError(t('auth.passwordTooShort'))
      return
    }

    setSubmitting(true)
    const { error } = await signUp(email, password)
    setSubmitting(false)

    if (error) {
      setError(error.message)
      return
    }

    setSuccess(true)
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="phase-dots" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
        <h1>{t('auth.registerTitle')}</h1>
        <p className="auth-subtitle">{t('auth.registerSubtitle')}</p>

        {success ? (
          <div className="auth-success" role="status" aria-live="polite">
            {t('auth.registerSuccessPrefix')}
            <Link to="/login">{t('auth.registerSuccessLink')}</Link>
            {t('auth.registerSuccessSuffix')}
          </div>
        ) : (
          <>
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
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <div className="field">
                <label htmlFor="confirmPassword">{t('auth.confirmPassword')}</label>
                <input
                  id="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>

              <button className="auth-submit" type="submit" disabled={submitting}>
                {submitting ? t('auth.creatingAccount') : t('auth.registerButton')}
              </button>
            </form>

            <p className="auth-switch">
              {t('auth.haveAccount')} <Link to="/login">{t('auth.loginLink')}</Link>
            </p>
          </>
        )}
      </div>
    </div>
  )
}
