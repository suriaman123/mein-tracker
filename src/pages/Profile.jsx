import { useEffect, useState } from 'react'
import { useAuth } from '../lib/AuthContext'
import { useProfile } from '../lib/useProfile'
import { useLanguage } from '../lib/LanguageContext'
import { saveProfile, uploadAvatar } from '../lib/profileCrud'
import Layout from '../components/Layout'
import AchievementsSection from '../components/AchievementsSection'
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
  const { t } = useLanguage()

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
        <h1>{t('profile.yourProfile')}</h1>
        <p>{t('profile.subtitle')}</p>
      </div>

      {loading ? (
        <p className="tracker-empty">{t('profile.loading')}</p>
      ) : (
        <form className="profile-form" onSubmit={handleSubmit}>
          {error && <div className="auth-error" role="alert">{error}</div>}
          {success && <div className="auth-success" role="status" aria-live="polite">{t('profile.profileSaved')}</div>}

          <div className="profile-grid">
            <div className="profile-card">
              <h2>{t('profile.photoHeading')}</h2>
              <div className="avatar-upload">
                <div className="avatar-upload-preview">
                  {displayedAvatar ? (
                    <img src={displayedAvatar} alt="Your profile photo" />
                  ) : (
                    <span>{(user?.email || '?').slice(0, 2).toUpperCase()}</span>
                  )}
                </div>
                <label className="history-btn avatar-upload-btn">
                  {t('profile.choosePhoto')}
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
              <h2>{t('profile.personalDetails')}</h2>

              <div className="field">
                <label htmlFor="fullName">{t('profile.name')}</label>
                <input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder={t('profile.namePlaceholder')}
                />
              </div>

              <div className="profile-field-row">
                <div className="field">
                  <label htmlFor="age">{t('profile.age')}</label>
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
                  <label htmlFor="heightCm">{t('profile.heightCm')}</label>
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
                  <label htmlFor="weightKg">{t('profile.weightKg')}</label>
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
              <h2>{t('profile.dailyGoals')}</h2>
              <p className="profile-card-sub">{t('profile.goalsSubtitle')}</p>

              <div className="profile-field-row">
                <div className="field">
                  <label htmlFor="goalSleep">{t('profile.goalSleep')}</label>
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
                  <label htmlFor="goalWater">{t('profile.goalWater')}</label>
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
                  <label htmlFor="goalStudy">{t('profile.goalStudy')}</label>
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
              <h2>{t('profile.quickAddHeading')}</h2>
              <p className="profile-card-sub">{t('profile.quickAddSubtitle')}</p>

              <div className="field">
                <label htmlFor="quickAddSleep">{t('profile.goalSleep')}</label>
                <input
                  id="quickAddSleep"
                  type="text"
                  value={quickAddSleep}
                  onChange={(e) => setQuickAddSleep(e.target.value)}
                  placeholder="0.5, 1, 2"
                />
              </div>
              <div className="field">
                <label htmlFor="quickAddWater">{t('profile.goalWater')}</label>
                <input
                  id="quickAddWater"
                  type="text"
                  value={quickAddWater}
                  onChange={(e) => setQuickAddWater(e.target.value)}
                  placeholder="0.25, 0.5, 1"
                />
              </div>
              <div className="field">
                <label htmlFor="quickAddStudy">{t('profile.goalStudy')}</label>
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
            {saving ? t('profile.savingProfile') : t('profile.saveProfile')}
          </button>
        </form>
      )}

      <div className="overview-header profile-section-header">
        <h1>{t('profileExtra.achievementsHeading')}</h1>
        <p>{t('profileExtra.achievementsSubtitle')}</p>
      </div>

      <AchievementsSection />
    </Layout>
  )
}
