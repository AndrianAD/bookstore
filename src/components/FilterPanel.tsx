'use client'

import { useCatalogFilters } from '@/lib/use-catalog-filters'
import FilterControls from './FilterControls'
import { FilterHeader, FilterPendingNote } from './FilterHeader'

/** Desktop sidebar; on small screens the filters live in `MobileFilters` instead. */
export default function FilterPanel() {
  const filters = useCatalogFilters()

  return (
    <aside className="hidden lg:block w-72 shrink-0">
      <div className="bg-white rounded-2xl shadow-card p-6 sticky top-24 space-y-6">
        <FilterHeader filters={filters} />
        <FilterControls filters={filters} />
        <FilterPendingNote filters={filters} />
      </div>
    </aside>
  )
}
