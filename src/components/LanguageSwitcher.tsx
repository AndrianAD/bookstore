'use client'

import { useRouter } from 'next/navigation'
import { useTransition } from 'react'
import { LOCALES, LOCALE_CODES, isLocale } from '@/lib/i18n'
import { useI18n } from '@/lib/i18n/client'
import { saveSiteLocale } from '@/lib/settings/site-settings'
import { createClient } from '@/lib/supabase/client'

interface LanguageSwitcherProps {
  className?: string
}

export default function LanguageSwitcher({ className = '' }: LanguageSwitcherProps) {
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

  return (
    <label className={`flex flex-col gap-1.5 ${className}`}>
      <span className="text-xs font-semibold uppercase tracking-wider opacity-60">{t.admin.language}</span>
      <select
        value={locale}
        disabled={isPending}
        onChange={(e) => handleChange(e.target.value)}
        className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-accent-300 disabled:opacity-60"
      >
        {LOCALE_CODES.map((code) => (
          <option key={code} value={code}>{LOCALES[code].label}</option>
        ))}
      </select>
    </label>
  )
}
