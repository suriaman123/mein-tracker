import { useEffect, useState } from 'react'
import { useAuth } from '../lib/AuthContext'
import { useProfile } from '../lib/useProfile'
import { saveProfile, uploadAvatar } from '../lib/profileCrud'
import Layout from '../components/Layout'
import './Profile.css'
import './Profile.css'

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

  const [avatarPreview, setAvatarPreview] = useState(null)
  const [avatarFile, setAvatarFile] = useState(null)

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (!profile) return
    setFullName(profile.full_name || '')
    setAge(profile.age ?? '')
    setHeightCm(profile.height_cm ?? '')
    setWeightKg(profile.weight_kg ?? '')
    setGoalSleep(profile.goal_sleep_hours ?? '')
    setGoalWater(profile.goal_water_liters ?? '')
    setGoalStudy(profile.goal_study_hours ?? '')
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
          </div>

          <button className="auth-submit profile-submit" type="submit" disabled={saving}>
            {saving ? 'Saving…' : 'Save profile'}
          </button>
        </form>
      )}
    </Layout>
  )
}
