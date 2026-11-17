'use client'

import { createContext, useContext, useMemo } from 'react'
import { DEFAULT_LOCALE, Dictionary, Locale, getDictionary } from '.'

interface I18nValue {
  locale: Locale
  t: Dictionary
}

const I18nContext = createContext<I18nValue>({ locale: DEFAULT_LOCALE, t: getDictionary(DEFAULT_LOCALE) })

/** Takes only the locale: dictionaries contain functions, which cannot cross the server/client boundary. */
export function I18nProvider({ locale, children }: { locale: Locale; children: React.ReactNode }) {
  const value = useMemo(() => ({ locale, t: getDictionary(locale) }), [locale])
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n() {
  return useContext(I18nContext)
}
