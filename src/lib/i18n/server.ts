import { cache } from 'react'
import { createClient } from '@/lib/supabase/server'
import { readSiteLocale } from '@/lib/settings/site-settings'
import { getDictionary } from '.'

export const getSiteLocale = cache(async () => readSiteLocale(await createClient()))

export async function getTranslations() {
  const locale = await getSiteLocale()
  return { locale, t: getDictionary(locale) }
}
