import { supabase } from './supabaseClient'

const TABLES = ['sleep_logs', 'water_logs', 'study_logs', 'personal_logs']

export async function downloadAllData(userId, profile) {
  const result = {
    exported_at: new Date().toISOString(),
    profile: profile || null,
  }

  for (const table of TABLES) {
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .eq('user_id', userId)
      .order('log_date', { ascending: true })

    if (error) {
      // Don't let one missing/failing table (e.g. personal_logs never set
      // up) block exporting everything else.
      result[table] = { error: error.message }
      continue
    }
    result[table] = data
  }

  const json = JSON.stringify(result, null, 2)
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `mein-tracker-backup-${new Date().toISOString().slice(0, 10)}.json`
  a.click()
  URL.revokeObjectURL(url)

  return { error: null }
}
