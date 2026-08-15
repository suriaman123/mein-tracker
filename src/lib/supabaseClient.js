import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  // This will show up loudly in the browser console instead of failing silently
  console.error(
    'Missing Supabase env vars. Did you create a .env file from .env.example?'
  )
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
