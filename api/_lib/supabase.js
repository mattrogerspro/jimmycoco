import { createClient } from '@supabase/supabase-js'

let client

function serverSecretKey() {
  return process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY
}

export function isSupabaseConfigured() {
  return Boolean(process.env.SUPABASE_URL && serverSecretKey())
}

export function getSupabase() {
  if (!isSupabaseConfigured()) throw new Error('supabase_not_configured')
  if (!client) {
    client = createClient(process.env.SUPABASE_URL, serverSecretKey(), {
      auth: { persistSession: false, autoRefreshToken: false },
      global: { headers: { 'X-Client-Info': 'sunless-campaign-studio/1.0' } },
    })
  }
  return client
}

export function assertSupabase(result, context) {
  if (result.error) throw new Error(`${context}: ${result.error.message}`)
  return result.data
}

export function oneRow(value) {
  return Array.isArray(value) ? value[0] || null : value
}
