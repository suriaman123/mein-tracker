import { useState } from 'react'
import { useAuth } from '../lib/AuthContext'
import { useProfile } from '../lib/useProfile'
import { useLanguage } from '../lib/LanguageContext'
import { downloadAllData } from '../lib/exportData'

export default function DataExportSection() {
  const { user } = useAuth()
  const { profile } = useProfile()
  const { t } = useLanguage()

  const [exporting, setExporting] = useState(false)
  const [exportError, setExportError] = useState('')

  return (
    <div className="profile-card">
      {exportError && <div className="auth-error" role="alert">{exportError}</div>}
      <p className="profile-card-sub">{t('profile.dataDescription')}</p>
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
        {exporting ? t('profile.preparingDownload') : t('profile.downloadData')}
      </button>
    </div>
  )
}
