import { createClient } from '@supabase/supabase-js'

/**
 * Bypasses row level security. Use only in server code that has no signed-in user,
 * such as the Telegram webhook.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !serviceKey) throw new Error('SUPABASE_SERVICE_ROLE_KEY is not configured')
  return createClient(url, serviceKey, { auth: { persistSession: false } })
}
