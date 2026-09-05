import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../lib/AuthContext'

export default function AccountSettings() {
  const { user } = useAuth()

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
      setEmailError('Enter a different email address.')
      return
    }

    setEmailSaving(true)
    const { error } = await supabase.auth.updateUser({ email: newEmail })
    setEmailSaving(false)

    if (error) {
      setEmailError(error.message)
      return
    }

    setEmailSuccess(
      `Confirmation link sent to ${newEmail}. Your login email won't change until you click it.`
    )
    setNewEmail('')
  }

  async function handlePasswordSubmit(e) {
    e.preventDefault()
    setPasswordError('')
    setPasswordSuccess('')

    if (newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters.')
      return
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords don't match.")
      return
    }

    setPasswordSaving(true)
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    setPasswordSaving(false)

    if (error) {
      setPasswordError(error.message)
      return
    }

    setPasswordSuccess('Password updated.')
    setNewPassword('')
    setConfirmPassword('')
  }

  return (
    <div className="profile-grid">
      <div className="profile-card">
        <h2>Change email</h2>
        <p className="profile-card-sub">
          Currently: <strong>{user?.email}</strong>
        </p>

        <form onSubmit={handleEmailSubmit}>
          {emailError && <div className="auth-error" role="alert">{emailError}</div>}
          {emailSuccess && <div className="auth-success" role="status" aria-live="polite">{emailSuccess}</div>}

          <div className="field">
            <label htmlFor="newEmail">New email</label>
            <input
              id="newEmail"
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="you@example.com"
            />
          </div>

          <button className="auth-submit" type="submit" disabled={emailSaving}>
            {emailSaving ? 'Sending…' : 'Update email'}
          </button>
        </form>
      </div>

      <div className="profile-card">
        <h2>Change password</h2>
        <p className="profile-card-sub">
          Choose a new password for your account.
        </p>

        <form onSubmit={handlePasswordSubmit}>
          {passwordError && <div className="auth-error" role="alert">{passwordError}</div>}
          {passwordSuccess && <div className="auth-success" role="status" aria-live="polite">{passwordSuccess}</div>}

          <div className="field">
            <label htmlFor="newPassword">New password</label>
            <input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              autoComplete="new-password"
            />
          </div>

          <div className="field">
            <label htmlFor="confirmNewPassword">Confirm new password</label>
            <input
              id="confirmNewPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
            />
          </div>

          <button className="auth-submit" type="submit" disabled={passwordSaving}>
            {passwordSaving ? 'Updating…' : 'Update password'}
          </button>
        </form>
      </div>
    </div>
  )
}
