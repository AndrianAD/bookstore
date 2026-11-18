'use client'

import { useRouter } from 'next/navigation'
import { useTransition } from 'react'
import { LOCALES, LOCALE_CODES, isLocale } from '@/lib/i18n'
import { useI18n } from '@/lib/i18n/client'
import { saveSiteLocale } from '@/lib/settings/site-settings'
import { createClient } from '@/lib/supabase/client'

interface LanguageSwitcherProps {
  /** Without the label and with short codes, for the mobile top bar. */
  compact?: boolean
}

export default function LanguageSwitcher({ compact = false }: LanguageSwitcherProps) {
  const router = useRouter()
  const { locale, t } = useI18n()
  const [isPending, startTransition] = useTransition()

  const handleChange = async (value: string) => {
    if (!isLocale(value) || value === locale) return
    try {
      await saveSiteLocale(createClient(), value)
      startTransition(() => router.refresh())
    } catch (error) {
      alert(t.admin.languageFailed((error as Error).message))
    }
  }

  const select = (
    <select
      value={locale}
      disabled={isPending}
      aria-label={t.admin.language}
      onChange={(e) => handleChange(e.target.value)}
      className={`rounded-full border border-gray-200 bg-white text-sm font-medium text-gray-700 focus:outline-none focus:ring-4 focus:ring-accent-100 focus:border-accent-300 disabled:opacity-60 ${
        compact ? 'h-9 px-3' : 'w-full h-9 px-3'
      }`}
    >
      {LOCALE_CODES.map((code) => (
        <option key={code} value={code}>{compact ? code.toUpperCase() : LOCALES[code].label}</option>
      ))}
    </select>
  )

  if (compact) return select

  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">{t.admin.language}</span>
      {select}
    </label>
  )
}
