'use client'

import { useSearchParams } from 'next/navigation'
import { readCatalogQuery, updateCatalogUrl } from '@/lib/catalog-query'
import { useI18n } from '@/lib/i18n/client'

const OPTIONS = [
  { value: 'newest',     key: 'newest' },
  { value: 'price_asc',  key: 'priceAsc' },
  { value: 'price_desc', key: 'priceDesc' },
  { value: 'title_asc',  key: 'titleAsc' },
] as const

export default function SortSelect() {
  const searchParams = useSearchParams()
  const { t } = useI18n()
  const current = readCatalogQuery(searchParams).sort

  const handleChange = (value: string) =>
    updateCatalogUrl(searchParams, { sort: value === 'newest' ? null : value })

  return (
    <div className="relative w-[9.5rem] sm:w-auto">
      <select
        value={current}
        onChange={(e) => handleChange(e.target.value)}
        aria-label={t.sort.label}
        className="appearance-none w-full truncate h-9 bg-white border border-gray-200 text-gray-700 text-[13px] font-medium rounded-full pl-3.5 pr-8 cursor-pointer hover:border-gray-300 focus:outline-none focus:ring-4 focus:ring-accent-100 focus:border-accent-300 transition-colors"
      >
        {OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>{t.sort[o.key]}</option>
        ))}
      </select>
      <svg
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400"
        fill="none" stroke="currentColor" viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
      </svg>
    </div>
  )
}
