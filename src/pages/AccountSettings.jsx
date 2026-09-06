import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../lib/AuthContext'
import { useLanguage } from '../lib/LanguageContext'

export default function AccountSettings() {
  const { user } = useAuth()
  const { t } = useLanguage()

  const [newEmail, setNewEmail] = useState('')
  const [emailSaving, setEmailSaving] = useState(false)
  const [emailError, setEmailError] = useState('')
  const [emailSuccess, setEmailSuccess] = useState('')

  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordSaving, setPasswordSaving] = useState(false)
  const [passwordError, setPasswordError] = useState('')
  const [passwordSuccess, setPasswordSuccess] = useState('')

  async function handleEmailSubmit(e) {
    e.preventDefault()
    setEmailError('')
    setEmailSuccess('')

    if (!newEmail || newEmail === user?.email) {
      setEmailError(t('accountSettings.emailDifferentError'))
      return
    }

    setEmailSaving(true)
    const { error } = await supabase.auth.updateUser({ email: newEmail })
    setEmailSaving(false)

    if (error) {
      setEmailError(error.message)
      return
    }

    setEmailSuccess(t('accountSettings.emailUpdateSuccess', { email: newEmail }))
    setNewEmail('')
  }

  async function handlePasswordSubmit(e) {
    e.preventDefault()
    setPasswordError('')
    setPasswordSuccess('')

    if (newPassword.length < 6) {
      setPasswordError(t('auth.passwordTooShort'))
      return
    }
    if (newPassword !== confirmPassword) {
      setPasswordError(t('auth.passwordsDontMatch'))
      return
    }

    setPasswordSaving(true)
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    setPasswordSaving(false)

    if (error) {
      setPasswordError(error.message)
      return
    }

    setPasswordSuccess(t('accountSettings.passwordUpdateSuccess'))
    setNewPassword('')
    setConfirmPassword('')
  }

  return (
    <div className="profile-grid">
      <div className="profile-card">
        <h2>{t('accountSettings.changeEmail')}</h2>
        <p className="profile-card-sub">
          {t('accountSettings.currentlyLabel')} <strong>{user?.email}</strong>
        </p>

        <form onSubmit={handleEmailSubmit}>
          {emailError && <div className="auth-error" role="alert">{emailError}</div>}
          {emailSuccess && <div className="auth-success" role="status" aria-live="polite">{emailSuccess}</div>}

          <div className="field">
            <label htmlFor="newEmail">{t('accountSettings.newEmail')}</label>
            <input
              id="newEmail"
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="you@example.com"
            />
          </div>

          <button className="auth-submit" type="submit" disabled={emailSaving}>
            {emailSaving ? t('accountSettings.sending') : t('accountSettings.updateEmail')}
          </button>
        </form>
      </div>

      <div className="profile-card">
        <h2>{t('accountSettings.changePassword')}</h2>
        <p className="profile-card-sub">{t('accountSettings.passwordSubtitle')}</p>

        <form onSubmit={handlePasswordSubmit}>
          {passwordError && <div className="auth-error" role="alert">{passwordError}</div>}
          {passwordSuccess && <div className="auth-success" role="status" aria-live="polite">{passwordSuccess}</div>}

          <div className="field">
            <label htmlFor="newPassword">{t('accountSettings.newPassword')}</label>
            <input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              autoComplete="new-password"
            />
          </div>

          <div className="field">
            <label htmlFor="confirmNewPassword">{t('accountSettings.confirmNewPassword')}</label>
            <input
              id="confirmNewPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
            />
          </div>

          <button className="auth-submit" type="submit" disabled={passwordSaving}>
            {passwordSaving ? t('accountSettings.updating') : t('accountSettings.updatePassword')}
          </button>
        </form>
      </div>
    </div>
  )
}
