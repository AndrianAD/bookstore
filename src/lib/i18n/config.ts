export type Locale = 'uk' | 'ru' | 'en'

export const DEFAULT_LOCALE: Locale = 'ru'

export const LOCALES: Record<Locale, { label: string; intl: string }> = {
  uk: { label: 'Українська', intl: 'uk-UA' },
  ru: { label: 'Русский', intl: 'ru-RU' },
  en: { label: 'English', intl: 'en-GB' },
}

export const LOCALE_CODES = Object.keys(LOCALES) as Locale[]

export function isLocale(value: unknown): value is Locale {
  return typeof value === 'string' && value in LOCALES
}
