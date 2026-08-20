import { supabase } from './supabaseClient'

// Upsert on (user_id, log_date): submitting the same date again
// naturally edits that day's entry instead of creating a duplicate,
// since the schema has a unique constraint on (user_id, log_date).
export async function saveLog(table, { userId, logDate, valueField, value, notes }) {
  const { data, error } = await supabase
    .from(table)
    .upsert(
      {
        user_id: userId,
        log_date: logDate,
        [valueField]: value,
        notes: notes || null,
      },
      { onConflict: 'user_id,log_date' }
    )
    .select()
    .single()

  return { data, error }
}

export async function deleteLog(table, id) {
  const { error } = await supabase.from(table).delete().eq('id', id)
  return { error }
}
