import { supabase } from './supabaseClient'

export async function listCustomTrackers(userId) {
  const { data, error } = await supabase
    .from('custom_trackers')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: true })

  return { data: data || [], error }
}

export async function getCustomTracker(id) {
  const { data, error } = await supabase
    .from('custom_trackers')
    .select('*')
    .eq('id', id)
    .maybeSingle()

  return { data, error }
}

export async function createCustomTracker(userId, fields) {
  const { data, error } = await supabase
    .from('custom_trackers')
    .insert({ user_id: userId, ...fields })
    .select()
    .single()

  return { data, error }
}

export async function updateCustomTracker(id, fields) {
  const { data, error } = await supabase
    .from('custom_trackers')
    .update(fields)
    .eq('id', id)
    .select()
    .single()

  return { data, error }
}

export async function deleteCustomTracker(id) {
  const { error } = await supabase.from('custom_trackers').delete().eq('id', id)
  return { error }
}
