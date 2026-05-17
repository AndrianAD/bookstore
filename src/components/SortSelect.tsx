'use client'

import { useRouter, useSearchParams } from 'next/navigation'

const OPTIONS = [
  { value: 'newest',      label: 'Новинки' },
  { value: 'price_asc',   label: 'Цена: сначала дешевле' },
  { value: 'price_desc',  label: 'Цена: сначала дороже' },
  { value: 'title_asc',   label: 'По названию' },
]

export default function SortSelect() {
  const router = useRouter()
  const searchParams = useSearchParams()
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
          <option key={o.value} value={o.value}>{o.label}</option>
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
