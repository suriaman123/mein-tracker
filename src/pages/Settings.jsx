import { useLanguage } from '../lib/LanguageContext'
import Layout from '../components/Layout'
import ManageTrackersSection from '../components/ManageTrackersSection'
import AccountSettings from './AccountSettings'
import DataExportSection from '../components/DataExportSection'
import './Profile.css'

export default function Settings() {
  const { t } = useLanguage()

  return (
    <Layout>
      <div className="overview-header">
        <h1>{t('settingsPage.pageTitle')}</h1>
        <p>{t('settingsPage.pageSubtitle')}</p>
      </div>

      <div className="overview-header profile-section-header">
        <h1>{t('settingsPage.trackersHeading')}</h1>
      </div>
      <ManageTrackersSection />

      <div className="overview-header profile-section-header">
        <h1>{t('settingsPage.accountHeading')}</h1>
        <p>{t('profile.accountSubtitle')}</p>
      </div>
      <AccountSettings />

      <div className="overview-header profile-section-header">
        <h1>{t('settingsPage.dataHeading')}</h1>
        <p>{t('profile.dataSubtitle')}</p>
      </div>
      <DataExportSection />
    </Layout>
  )
}
