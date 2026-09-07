import { supabase } from './supabaseClient'

// Upsert on (user_id, log_date) by default: submitting the same date
// again naturally edits that day's entry instead of creating a duplicate.
// Custom trackers share one table distinguished by tracker_id, so they
// pass extraFields: { tracker_id } and conflictTarget: 'tracker_id,log_date'.
export async function saveLog(
  table,
  { userId, logDate, valueField, value, notes, extraFields, conflictTarget }
) {
  const { data, error } = await supabase
    .from(table)
    .upsert(
      {
        user_id: userId,
        log_date: logDate,
        [valueField]: value,
        notes: notes || null,
        ...extraFields,
      },
      { onConflict: conflictTarget || 'user_id,log_date' }
    )
    .select()
    .single()

  return { data, error }
}

export async function deleteLog(table, id) {
  const { error } = await supabase.from(table).delete().eq('id', id)
  return { error }
}
