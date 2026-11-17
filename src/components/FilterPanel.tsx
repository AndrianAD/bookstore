'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useCallback, useTransition } from 'react'
import { genreLabel } from '@/lib/i18n'
import { useI18n } from '@/lib/i18n/client'
import { BOOK_CONDITION_CODES, GENRES } from '@/lib/types'

const CONDITION_OPTIONS = ['', ...BOOK_CONDITION_CODES] as const

export default function FilterPanel() {
  const { t } = useI18n()
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const createQueryString = useCallback(
    (updates: Record<string, string>) => {
      const params = new URLSearchParams(searchParams.toString())
      Object.entries(updates).forEach(([key, value]) => {
        if (value) params.set(key, value)
        else params.delete(key)
      })
      params.delete('page')
      return params.toString()
    },
    [searchParams]
  )

  const handleChange = (key: string, value: string) => {
    startTransition(() => {
      router.push(`${pathname}?${createQueryString({ [key]: value })}`, { scroll: false })
    })
  }

  const handleReset = () => startTransition(() => router.push(pathname, { scroll: false }))

  const hasFilters =
    searchParams.get('condition') ||
    searchParams.get('genre') ||
    searchParams.get('minPrice') ||
    searchParams.get('maxPrice') ||
    searchParams.get('author')

  const activeCount = [
    searchParams.get('condition'),
    searchParams.get('genre'),
    searchParams.get('minPrice') || searchParams.get('maxPrice'),
    searchParams.get('author'),
  ].filter(Boolean).length

  return (
    <aside className="w-full lg:w-72 shrink-0">
      <div className="bg-white rounded-2xl shadow-card p-6 sticky top-24">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-accent-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            <h2 className="font-bold text-gray-900 text-base">{t.filters.title}</h2>
            {activeCount > 0 && (
              <span className="bg-accent-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                {activeCount}
              </span>
            )}
          </div>
          {hasFilters && (
            <button
              onClick={handleReset}
              className="text-xs text-accent-600 hover:text-accent-700 font-semibold flex items-center gap-1"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
              {t.filters.reset}
            </button>
          )}
        </div>

        <div className="space-y-6">
          {/* Condition */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              {t.filters.condition}
            </label>
            <div className="grid grid-cols-3 gap-1 p-1 bg-gray-100 rounded-xl">
              {CONDITION_OPTIONS.map((value) => {
                const active = (searchParams.get('condition') || '') === value
                return (
                  <button
                    key={value || 'all'}
                    onClick={() => handleChange('condition', value)}
                    disabled={isPending}
                    className={`py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 ${
                      active ? 'bg-white text-accent-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {value ? t.conditions[value] : t.common.all}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Genre */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              {t.filters.genre}
            </label>
            <div className="flex flex-wrap gap-2">
              {['', ...GENRES].map((g) => {
                const active = (searchParams.get('genre') || '') === g
                return (
                  <button
                    key={g || 'all'}
                    onClick={() => handleChange('genre', g)}
                    disabled={isPending}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all duration-150 ${
                      active
                        ? 'bg-accent-500 text-white shadow-glow-sm'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {g ? genreLabel(t, g) : t.common.all}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Price */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              {t.filters.price}
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                placeholder={t.filters.priceFrom}
                min={0}
                value={searchParams.get('minPrice') || ''}
                onChange={(e) => handleChange('minPrice', e.target.value)}
                className="input-field text-center"
                disabled={isPending}
              />
              <span className="text-gray-400 shrink-0">—</span>
              <input
                type="number"
                placeholder={t.filters.priceTo}
                min={0}
                value={searchParams.get('maxPrice') || ''}
                onChange={(e) => handleChange('maxPrice', e.target.value)}
                className="input-field text-center"
                disabled={isPending}
              />
            </div>
          </div>

          {/* Author */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              {t.filters.author}
            </label>
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <input
                type="text"
                placeholder={t.filters.authorPlaceholder}
                value={searchParams.get('author') || ''}
                onChange={(e) => handleChange('author', e.target.value)}
                className="input-field pl-9"
                disabled={isPending}
              />
            </div>
          </div>
        </div>

        {isPending && (
          <div className="mt-5 flex items-center gap-2 text-xs text-accent-600 font-medium">
            <div className="w-3.5 h-3.5 border-2 border-accent-500 border-t-transparent rounded-full animate-spin" />
            {t.filters.updating}
          </div>
        )}
      </div>
    </aside>
  )
}
