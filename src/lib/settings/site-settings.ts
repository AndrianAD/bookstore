import type { SupabaseClient } from '@supabase/supabase-js'
import { DEFAULT_LOCALE, Locale, isLocale } from '@/lib/i18n/config'

const SETTINGS_ROW_ID = 1

/** Falls back to the default language if the settings table is missing or unreadable. */
export async function readSiteLocale(supabase: SupabaseClient): Promise<Locale> {
  const { data, error } = await supabase
    .from('site_settings')
    .select('locale')
    .eq('id', SETTINGS_ROW_ID)
    .maybeSingle()
  if (error) console.error('Could not read site settings:', error.message)
  return isLocale(data?.locale) ? data.locale : DEFAULT_LOCALE
}

export async function saveSiteLocale(supabase: SupabaseClient, locale: Locale) {
  const { error } = await supabase
    .from('site_settings')
    .update({ locale, updated_at: new Date().toISOString() })
    .eq('id', SETTINGS_ROW_ID)
  if (error) throw new Error(error.message)
}
