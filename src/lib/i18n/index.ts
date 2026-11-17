import { Locale } from './config'
import { en } from './dictionaries/en'
import { Dictionary, ru } from './dictionaries/ru'
import { uk } from './dictionaries/uk'

export type { Dictionary }
export * from './config'

const DICTIONARIES: Record<Locale, Dictionary> = { uk, ru, en }

export function getDictionary(locale: Locale): Dictionary {
  return DICTIONARIES[locale]
}

export function genreLabel(t: Dictionary, genre: string) {
  return t.genres[genre as keyof Dictionary['genres']] ?? genre
}
