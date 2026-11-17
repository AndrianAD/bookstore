'use client'

import { useState } from 'react'
import { useI18n } from '@/lib/i18n/client'
import { useCatalogFilters } from '@/lib/use-catalog-filters'
import Drawer from './Drawer'
import FilterControls from './FilterControls'
import { ActiveFiltersBadge, FilterHeader, FilterIcon, FilterPendingNote } from './FilterHeader'

interface MobileFiltersProps {
  /** Number of books matching the current filters, shown on the apply button. */
  resultsCount: number
}

export default function MobileFilters({ resultsCount }: MobileFiltersProps) {
  const { t } = useI18n()
  const filters = useCatalogFilters()
  const [open, setOpen] = useState(false)
  const close = () => setOpen(false)

  return (
    <div className="lg:hidden">
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 text-sm font-medium rounded-xl px-3 py-2 hover:border-accent-400 transition-colors"
      >
        <FilterIcon className="w-4 h-4 text-accent-500" />
        {t.filters.title}
        <ActiveFiltersBadge count={filters.activeCount} />
      </button>

      <Drawer open={open} onClose={close} side="left" label={t.filters.title} className="w-[85%] max-w-sm">
        <div className="px-5 py-4 border-b border-gray-100 shrink-0">
          <FilterHeader filters={filters}>
            <button
              onClick={close}
              aria-label={t.common.close}
              className="w-9 h-9 -mr-2 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-all"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </FilterHeader>
        </div>

        <div className="flex-1 overflow-y-auto min-h-0 px-5 py-5 space-y-5">
          <FilterControls filters={filters} />
          <FilterPendingNote filters={filters} />
        </div>

        <div className="border-t border-gray-100 px-5 py-4 shrink-0">
          <button onClick={close} className="btn-primary w-full py-3 text-sm">
            {t.filters.showResults(resultsCount)}
          </button>
        </div>
      </Drawer>
    </div>
  )
}
