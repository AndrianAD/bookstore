'use client'

import { genreLabel } from '@/lib/i18n'
import { useI18n } from '@/lib/i18n/client'
import { GENRES } from '@/lib/types'
import { useCatalogFilters } from '@/lib/use-catalog-filters'

const OPTIONS = ['', ...GENRES] as const

/** One-tap genre filter for phones; scrolls sideways instead of wrapping. */
export default function GenreChips() {
  const { t } = useI18n()
  const { get, set, isPending } = useCatalogFilters()
  const selected = get('genre')

  return (
    <div className="lg:hidden -mx-4 sm:-mx-6 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <div className="flex gap-2 px-4 sm:px-6 w-max">
        {OPTIONS.map((genre) => {
          const active = selected === genre
          return (
            <button
              key={genre || 'all'}
              onClick={() => set('genre', genre)}
              disabled={isPending}
              aria-pressed={active}
              className={`h-8 px-3.5 rounded-full text-[13px] font-medium whitespace-nowrap border transition-colors ${
                active
                  ? 'bg-gray-900 border-gray-900 text-white'
                  : 'bg-white border-gray-200 text-gray-700 active:bg-gray-100'
              }`}
            >
              {genre ? genreLabel(t, genre) : t.common.all}
            </button>
          )
        })}
      </div>
    </div>
  )
}
