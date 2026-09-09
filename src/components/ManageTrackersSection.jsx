import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../lib/AuthContext'
import { useLanguage } from '../lib/LanguageContext'
import { useConfirm } from '../lib/ConfirmContext'
import { useCustomTrackers } from '../lib/useCustomTrackers'
import { createCustomTracker, updateCustomTracker, deleteCustomTracker } from '../lib/customTrackers'
import { CUSTOM_COLOR_PRESETS } from '../lib/colorPresets'
import './ManageTrackersSection.css'

const emptyForm = {
  name: '',
  unit: '',
  min_value: 0,
  max_value: 100,
  step: 1,
  color_key: CUSTOM_COLOR_PRESETS[0].key,
  value_type: 'number',
}

export default function ManageTrackersSection() {
  const { user } = useAuth()
  const { t } = useLanguage()
  const confirm = useConfirm()
  const { trackers, loading, refresh } = useCustomTrackers()

  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [deletingId, setDeletingId] = useState(null)

  const isBoolean = form.value_type === 'boolean'

  function startEdit(tracker) {
    setEditingId(tracker.id)
    setForm({
      name: tracker.name,
      unit: tracker.unit,
      min_value: tracker.min_value,
      max_value: tracker.max_value,
      step: tracker.step,
      color_key: tracker.color_key,
      value_type: tracker.value_type || 'number',
    })
    setError('')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function resetForm() {
    setEditingId(null)
    setForm(emptyForm)
    setError('')
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (!form.name.trim()) {
      setError(t('customTrackers.nameRequired'))
      return
    }

    let fields

    if (form.value_type === 'boolean') {
      fields = {
        name: form.name.trim(),
        unit: '',
        min_value: 0,
        max_value: 1,
        step: 1,
        color_key: form.color_key,
        value_type: 'boolean',
      }
    } else {
      if (!form.unit.trim()) {
        setError(t('customTrackers.unitRequired'))
        return
      }
      if (Number(form.max_value) <= Number(form.min_value)) {
        setError(t('customTrackers.rangeInvalid'))
        return
      }
      fields = {
        name: form.name.trim(),
        unit: form.unit.trim(),
        min_value: Number(form.min_value),
        max_value: Number(form.max_value),
        step: Number(form.step),
        color_key: form.color_key,
        value_type: 'number',
      }
    }

    setSaving(true)

    const { error } = editingId
      ? await updateCustomTracker(editingId, fields)
      : await createCustomTracker(user.id, fields)

    setSaving(false)

    if (error) {
      setError(error.message)
      return
    }

    resetForm()
    refresh()
  }

  async function handleDelete(tracker) {
    const confirmed = await confirm(
      t('customTrackers.deleteConfirm', { name: tracker.name })
    )
    if (!confirmed) return

    setDeletingId(tracker.id)
    const { error } = await deleteCustomTracker(tracker.id)
    setDeletingId(null)

    if (error) {
      setError(error.message)
      return
    }
    refresh()
  }

  return (
    <div className="manage-trackers-layout">
      <form className="tracker-form" onSubmit={handleSubmit}>
        <h2>
          {editingId ? t('customTrackers.updateButton') : t('customTrackers.addNew')}
        </h2>

        {error && <div className="auth-error" role="alert">{error}</div>}

        <div className="field">
          <label htmlFor="ctName">{t('customTrackers.nameLabel')}</label>
          <input
            id="ctName"
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder={t('customTrackers.namePlaceholder')}
          />
        </div>

        <div className="field">
          <label>{t('trackerExtra.valueTypeLabel')}</label>
          <div className="value-type-row">
            <button
              type="button"
              className={`value-type-btn${!isBoolean ? ' value-type-active' : ''}`}
              onClick={() => setForm({ ...form, value_type: 'number' })}
            >
              {t('trackerExtra.valueTypeNumber')}
            </button>
            <button
              type="button"
              className={`value-type-btn${isBoolean ? ' value-type-active' : ''}`}
              onClick={() => setForm({ ...form, value_type: 'boolean' })}
            >
              {t('trackerExtra.valueTypeBoolean')}
            </button>
          </div>
        </div>

        {!isBoolean && (
          <>
            <div className="field">
              <label htmlFor="ctUnit">{t('customTrackers.unitLabel')}</label>
              <input
                id="ctUnit"
                type="text"
                value={form.unit}
                onChange={(e) => setForm({ ...form, unit: e.target.value })}
                placeholder={t('customTrackers.unitPlaceholder')}
              />
            </div>

            <div className="profile-field-row">
              <div className="field">
                <label htmlFor="ctMin">{t('customTrackers.minLabel')}</label>
                <input
                  id="ctMin"
                  type="number"
                  value={form.min_value}
                  onChange={(e) => setForm({ ...form, min_value: e.target.value })}
                />
              </div>
              <div className="field">
                <label htmlFor="ctMax">{t('customTrackers.maxLabel')}</label>
                <input
                  id="ctMax"
                  type="number"
                  value={form.max_value}
                  onChange={(e) => setForm({ ...form, max_value: e.target.value })}
                />
              </div>
              <div className="field">
                <label htmlFor="ctStep">{t('customTrackers.stepLabel')}</label>
                <input
                  id="ctStep"
                  type="number"
                  step="0.01"
                  value={form.step}
                  onChange={(e) => setForm({ ...form, step: e.target.value })}
                />
              </div>
            </div>
          </>
        )}

        <div className="field">
          <label>{t('customTrackers.colorLabel')}</label>
          <div className="color-swatch-row">
            {CUSTOM_COLOR_PRESETS.map((preset) => (
              <button
                key={preset.key}
                type="button"
                className={`color-swatch${form.color_key === preset.key ? ' color-swatch-active' : ''}`}
                style={{ background: preset.hex }}
                aria-label={preset.label}
                onClick={() => setForm({ ...form, color_key: preset.key })}
              />
            ))}
          </div>
        </div>

        <div className="manage-form-actions">
          <button className="auth-submit" type="submit" disabled={saving}>
            {saving
              ? editingId
                ? t('customTrackers.updating')
                : t('customTrackers.creating')
              : editingId
                ? t('customTrackers.updateButton')
                : t('customTrackers.createButton')}
          </button>
          {editingId && (
            <button type="button" className="history-btn" onClick={resetForm}>
              {t('customTrackers.cancelEdit')}
            </button>
          )}
        </div>
      </form>

      <div className="tracker-list">
        <h2>{t('customTrackers.yourTrackers')}</h2>

        {loading ? (
          <p className="tracker-empty">{t('tracker.loading')}</p>
        ) : trackers.length === 0 ? (
          <p className="tracker-empty">{t('customTrackers.noTrackers')}</p>
        ) : (
          <ul className="log-list">
            {trackers.map((tracker) => (
              <li key={tracker.id} className="log-row">
                <div className="log-row-main">
                  <span
                    className="tracker-color-dot"
                    style={{
                      background: CUSTOM_COLOR_PRESETS.find((c) => c.key === tracker.color_key)?.hex,
                    }}
                  />
                  <span className="log-value">{tracker.name}</span>
                  <span className="log-date">
                    ({tracker.value_type === 'boolean' ? t('trackerExtra.valueTypeBoolean') : tracker.unit})
                  </span>
                </div>
                <div className="log-row-actions">
                  <Link className="log-action-btn" to={`/custom/${tracker.id}`}>
                    {t('nav.overview')}
                  </Link>
                  <button
                    type="button"
                    className="log-action-btn"
                    onClick={() => startEdit(tracker)}
                  >
                    {t('customTrackers.editButton')}
                  </button>
                  <button
                    type="button"
                    className="log-action-btn log-action-danger"
                    disabled={deletingId === tracker.id}
                    onClick={() => handleDelete(tracker)}
                  >
                    {t('customTrackers.deleteButton')}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
