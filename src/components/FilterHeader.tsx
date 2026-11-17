'use client'

import { useI18n } from '@/lib/i18n/client'
import type { CatalogFilters } from '@/lib/use-catalog-filters'

export function FilterIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
    </svg>
  )
}

export function ActiveFiltersBadge({ count }: { count: number }) {
  if (count === 0) return null
  return (
    <span className="bg-accent-500 text-white text-xs font-bold min-w-5 h-5 px-1 rounded-full flex items-center justify-center">
      {count}
    </span>
  )
}

export function FilterHeader({ filters, children }: { filters: CatalogFilters; children?: React.ReactNode }) {
  const { t } = useI18n()
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-2">
        <FilterIcon className="w-5 h-5 text-accent-500" />
        <h2 className="font-bold text-gray-900 text-base">{t.filters.title}</h2>
        <ActiveFiltersBadge count={filters.activeCount} />
      </div>
      <div className="flex items-center gap-2">
        {filters.activeCount > 0 && (
          <button
            onClick={filters.reset}
            className="text-xs text-accent-600 hover:text-accent-700 font-semibold flex items-center gap-1"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
            {t.filters.reset}
          </button>
        )}
        {children}
      </div>
    </div>
  )
}

export function FilterPendingNote({ filters }: { filters: CatalogFilters }) {
  const { t } = useI18n()
  if (!filters.isPending) return null
  return (
    <div className="flex items-center gap-2 text-xs text-accent-600 font-medium">
      <div className="w-3.5 h-3.5 border-2 border-accent-500 border-t-transparent rounded-full animate-spin" />
      {t.filters.updating}
    </div>
  )
}
