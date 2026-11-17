'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useI18n } from '@/lib/i18n/client'

const OPTIONS = [
  { value: 'newest',     key: 'newest' },
  { value: 'price_asc',  key: 'priceAsc' },
  { value: 'price_desc', key: 'priceDesc' },
  { value: 'title_asc',  key: 'titleAsc' },
] as const

export default function SortSelect() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { t } = useI18n()
  const current = searchParams.get('sort') ?? 'newest'

  const handleChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value === 'newest') params.delete('sort')
    else params.set('sort', value)
    router.push(`/?${params.toString()}`, { scroll: false })
  }

  return (
    <div className="relative">
      <select
        value={current}
        onChange={(e) => handleChange(e.target.value)}
        className="appearance-none bg-white border border-gray-200 text-gray-700 text-sm font-medium rounded-xl pl-3 pr-8 py-2 cursor-pointer hover:border-accent-400 focus:outline-none focus:ring-2 focus:ring-accent-300 transition-colors"
      >
        {OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>{t.sort[o.key]}</option>
        ))}
      </select>
      <svg
        className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400"
        fill="none" stroke="currentColor" viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
      </svg>
    </div>
  )
}
