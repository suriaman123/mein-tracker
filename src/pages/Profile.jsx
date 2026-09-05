import { useEffect, useState } from 'react'
import { useAuth } from '../lib/AuthContext'
import { useProfile } from '../lib/useProfile'
import { saveProfile, uploadAvatar } from '../lib/profileCrud'
import { downloadAllData } from '../lib/exportData'
import Layout from '../components/Layout'
import AccountSettings from './AccountSettings'
import './Profile.css'

const DEFAULT_QUICK_ADD = {
  sleep: [0.5, 1, 2],
  water: [0.25, 0.5, 1],
  study: [0.5, 1, 2],
}

function parseSteps(text) {
  return text
    .split(',')
    .map((s) => parseFloat(s.trim()))
    .filter((n) => !Number.isNaN(n) && n > 0)
    .slice(0, 4)
}

export default function Profile() {
  const { user } = useAuth()
  const { profile, loading, refresh } = useProfile()

  const [fullName, setFullName] = useState('')
  const [age, setAge] = useState('')
  const [heightCm, setHeightCm] = useState('')
  const [weightKg, setWeightKg] = useState('')
  const [goalSleep, setGoalSleep] = useState('')
  const [goalWater, setGoalWater] = useState('')
  const [goalStudy, setGoalStudy] = useState('')

  const [quickAddSleep, setQuickAddSleep] = useState('0.5, 1, 2')
  const [quickAddWater, setQuickAddWater] = useState('0.25, 0.5, 1')
  const [quickAddStudy, setQuickAddStudy] = useState('0.5, 1, 2')

  const [avatarPreview, setAvatarPreview] = useState(null)
  const [avatarFile, setAvatarFile] = useState(null)

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const [exporting, setExporting] = useState(false)
  const [exportError, setExportError] = useState('')

  useEffect(() => {
    if (!profile) return
    setFullName(profile.full_name || '')
    setAge(profile.age ?? '')
    setHeightCm(profile.height_cm ?? '')
    setWeightKg(profile.weight_kg ?? '')
    setGoalSleep(profile.goal_sleep_hours ?? '')
    setGoalWater(profile.goal_water_liters ?? '')
    setGoalStudy(profile.goal_study_hours ?? '')

    const qa = profile.quick_add_steps || DEFAULT_QUICK_ADD
    setQuickAddSleep((qa.sleep || DEFAULT_QUICK_ADD.sleep).join(', '))
    setQuickAddWater((qa.water || DEFAULT_QUICK_ADD.water).join(', '))
    setQuickAddStudy((qa.study || DEFAULT_QUICK_ADD.study).join(', '))
  }, [profile])

  function handleAvatarChange(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setAvatarFile(file)
    setAvatarPreview(URL.createObjectURL(file))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSuccess(false)
    setSaving(true)

    let avatarUrl = profile?.avatar_url || null

    if (avatarFile) {
      const { url, error: uploadError } = await uploadAvatar(user.id, avatarFile)
      if (uploadError) {
        setSaving(false)
        setError(`Photo upload failed: ${uploadError.message}`)
        return
      }
      avatarUrl = url
    }

    const { error } = await saveProfile(user.id, {
      full_name: fullName || null,
      age: age === '' ? null : Number(age),
      height_cm: heightCm === '' ? null : Number(heightCm),
      weight_kg: weightKg === '' ? null : Number(weightKg),
      avatar_url: avatarUrl,
      goal_sleep_hours: goalSleep === '' ? null : Number(goalSleep),
      goal_water_liters: goalWater === '' ? null : Number(goalWater),
      goal_study_hours: goalStudy === '' ? null : Number(goalStudy),
      quick_add_steps: {
        sleep: parseSteps(quickAddSleep).length ? parseSteps(quickAddSleep) : DEFAULT_QUICK_ADD.sleep,
        water: parseSteps(quickAddWater).length ? parseSteps(quickAddWater) : DEFAULT_QUICK_ADD.water,
        study: parseSteps(quickAddStudy).length ? parseSteps(quickAddStudy) : DEFAULT_QUICK_ADD.study,
      },
    })

    setSaving(false)

    if (error) {
      setError(error.message)
      return
    }

    setAvatarFile(null)
    setSuccess(true)
    refresh()
    setTimeout(() => setSuccess(false), 4000)
  }

  const displayedAvatar = avatarPreview || profile?.avatar_url

  return (
    <Layout>
      <div className="overview-header">
        <h1>Your profile</h1>
        <p>Personal details and daily goals — visible only to you.</p>
      </div>

      {loading ? (
        <p className="tracker-empty">Loading…</p>
      ) : (
        <form className="profile-form" onSubmit={handleSubmit}>
          {error && <div className="auth-error">{error}</div>}
          {success && <div className="auth-success">Profile saved.</div>}

          <div className="profile-grid">
            <div className="profile-card">
              <h2>Photo</h2>
              <div className="avatar-upload">
                <div className="avatar-upload-preview">
                  {displayedAvatar ? (
                    <img src={displayedAvatar} alt="" />
                  ) : (
                    <span>{(user?.email || '?').slice(0, 2).toUpperCase()}</span>
                  )}
                </div>
                <label className="history-btn avatar-upload-btn">
                  Choose photo
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    hidden
                  />
                </label>
              </div>
            </div>

            <div className="profile-card">
              <h2>Personal details</h2>

              <div className="field">
                <label htmlFor="fullName">Name</label>
                <input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Your name"
                />
              </div>

              <div className="profile-field-row">
                <div className="field">
                  <label htmlFor="age">Age</label>
                  <input
                    id="age"
                    type="number"
                    min="0"
                    max="150"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                  />
                </div>
                <div className="field">
                  <label htmlFor="heightCm">Height (cm)</label>
                  <input
                    id="heightCm"
                    type="number"
                    min="0"
                    step="0.1"
                    value={heightCm}
                    onChange={(e) => setHeightCm(e.target.value)}
                  />
                </div>
                <div className="field">
                  <label htmlFor="weightKg">Weight (kg)</label>
                  <input
                    id="weightKg"
                    type="number"
                    min="0"
                    step="0.1"
                    value={weightKg}
                    onChange={(e) => setWeightKg(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="profile-card">
              <h2>Daily goals</h2>
              <p className="profile-card-sub">
                Set targets for each tracker — used to give you something to aim for.
              </p>

              <div className="profile-field-row">
                <div className="field">
                  <label htmlFor="goalSleep">Sleep (hrs)</label>
                  <input
                    id="goalSleep"
                    type="number"
                    min="0"
                    max="24"
                    step="0.25"
                    value={goalSleep}
                    onChange={(e) => setGoalSleep(e.target.value)}
                    placeholder="8"
                  />
                </div>
                <div className="field">
                  <label htmlFor="goalWater">Water (L)</label>
                  <input
                    id="goalWater"
                    type="number"
                    min="0"
                    max="15"
                    step="0.1"
                    value={goalWater}
                    onChange={(e) => setGoalWater(e.target.value)}
                    placeholder="2.5"
                  />
                </div>
                <div className="field">
                  <label htmlFor="goalStudy">Study (hrs)</label>
                  <input
                    id="goalStudy"
                    type="number"
                    min="0"
                    max="24"
                    step="0.25"
                    value={goalStudy}
                    onChange={(e) => setGoalStudy(e.target.value)}
                    placeholder="3"
                  />
                </div>
              </div>
            </div>
            <div className="profile-card">
              <h2>Quick add buttons</h2>
              <p className="profile-card-sub">
                Comma-separated amounts shown as tap-to-log buttons on each tracker page.
              </p>

              <div className="field">
                <label htmlFor="quickAddSleep">Sleep (hrs)</label>
                <input
                  id="quickAddSleep"
                  type="text"
                  value={quickAddSleep}
                  onChange={(e) => setQuickAddSleep(e.target.value)}
                  placeholder="0.5, 1, 2"
                />
              </div>
              <div className="field">
                <label htmlFor="quickAddWater">Water (L)</label>
                <input
                  id="quickAddWater"
                  type="text"
                  value={quickAddWater}
                  onChange={(e) => setQuickAddWater(e.target.value)}
                  placeholder="0.25, 0.5, 1"
                />
              </div>
              <div className="field">
                <label htmlFor="quickAddStudy">Study (hrs)</label>
                <input
                  id="quickAddStudy"
                  type="text"
                  value={quickAddStudy}
                  onChange={(e) => setQuickAddStudy(e.target.value)}
                  placeholder="0.5, 1, 2"
                />
              </div>
            </div>
          </div>

          <button className="auth-submit profile-submit" type="submit" disabled={saving}>
            {saving ? 'Saving…' : 'Save profile'}
          </button>
        </form>
      )}

      <div className="overview-header profile-section-header">
        <h1>Your data</h1>
        <p>Download everything you've logged as a single JSON file.</p>
      </div>

      <div className="profile-card">
        {exportError && <div className="auth-error">{exportError}</div>}
        <p className="profile-card-sub">
          Includes every entry across Sleep, Water, and Study (all-time, not just this
          year), plus your profile details. Useful as a backup or if you ever want to
          move your data elsewhere.
        </p>
        <button
          type="button"
          className="history-btn history-btn-primary"
          disabled={exporting}
          onClick={async () => {
            setExportError('')
            setExporting(true)
            const { error } = await downloadAllData(user.id, profile)
            setExporting(false)
            if (error) setExportError(error.message)
          }}
        >
          {exporting ? 'Preparing download…' : 'Download my data (JSON)'}
        </button>
      </div>

      <div className="overview-header profile-section-header">
        <h1>Account</h1>
        <p>Update your login email or password.</p>
      </div>

      <AccountSettings />
    </Layout>
  )
}
