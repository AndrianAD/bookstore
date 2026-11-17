'use client'

import { genreLabel } from '@/lib/i18n'
import { useI18n } from '@/lib/i18n/client'
import { BOOK_CONDITION_CODES, GENRES } from '@/lib/types'
import type { CatalogFilters } from '@/lib/use-catalog-filters'

const CONDITION_OPTIONS = ['', ...BOOK_CONDITION_CODES] as const
const GENRE_OPTIONS = ['', ...GENRES] as const

export default function FilterControls({ filters }: { filters: CatalogFilters }) {
  const { t } = useI18n()
  const { get, set, isPending } = filters

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
          {t.filters.condition}
        </label>
        <div className="grid grid-cols-3 gap-1 p-1 bg-gray-100 rounded-full">
          {CONDITION_OPTIONS.map((value) => (
            <button
              key={value || 'all'}
              onClick={() => set('condition', value)}
              disabled={isPending}
              className={`h-8 rounded-full text-[13px] font-medium transition-all duration-150 ${
                get('condition') === value ? 'bg-white text-accent-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {value ? t.conditions[value] : t.common.all}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
          {t.filters.genre}
        </label>
        <div className="flex flex-wrap gap-2">
          {GENRE_OPTIONS.map((genre) => (
            <button
              key={genre || 'all'}
              onClick={() => set('genre', genre)}
              disabled={isPending}
              className={`h-8 px-3 rounded-full text-[13px] font-medium border transition-colors ${
                get('genre') === genre
                  ? 'bg-gray-900 border-gray-900 text-white'
                  : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300'
              }`}
            >
              {genre ? genreLabel(t, genre) : t.common.all}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
