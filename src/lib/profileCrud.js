import { supabase } from './supabaseClient'

export async function getProfile(userId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle()

  return { data, error }
}

export async function saveProfile(userId, fields) {
  const { data, error } = await supabase
    .from('profiles')
    .upsert({ user_id: userId, ...fields }, { onConflict: 'user_id' })
    .select()
    .single()

  return { data, error }
}

export async function uploadAvatar(userId, file) {
  const ext = file.name.split('.').pop()
  const path = `${userId}/avatar.${ext}`

  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(path, file, { upsert: true })

  if (uploadError) {
    return { url: null, error: uploadError }
  }

  const { data } = supabase.storage.from('avatars').getPublicUrl(path)
  // Cache-bust so the new photo shows immediately instead of a stale cached one
  const url = `${data.publicUrl}?t=${Date.now()}`

  return { url, error: null }
}
