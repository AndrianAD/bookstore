'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState, useTransition } from 'react'
import { useI18n } from '@/lib/i18n/client'

const DEBOUNCE_MS = 400

/** Always searches the catalog, so it works from any page that shows the site header. */
export default function SearchBar() {
  const { t } = useI18n()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()
  const current = searchParams.get('search') ?? ''
  const [value, setValue] = useState(current)

  useEffect(() => setValue(current), [current])

  useEffect(() => {
    if (value.trim() === current) return
    const timer = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString())
      if (value.trim()) params.set('search', value.trim())
      else params.delete('search')
      const query = params.toString()
      startTransition(() => router.push(query ? `/?${query}` : '/', { scroll: false }))
    }, DEBOUNCE_MS)
    return () => clearTimeout(timer)
  }, [value, current, router, searchParams])

  return (
    <div className="relative group">
      <div className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none">
        {isPending ? (
          <div className="w-4 h-4 border-2 border-accent-400 border-t-transparent rounded-full animate-spin" />
        ) : (
          <svg className="w-4 h-4 text-gray-400 group-focus-within:text-accent-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        )}
      </div>
      <input
        type="search"
        enterKeyHint="search"
        aria-label={t.catalog.searchPlaceholder}
        placeholder={t.catalog.searchPlaceholder}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="w-full h-10 pl-10 pr-9 rounded-full text-[15px] text-gray-900 placeholder-gray-400 bg-gray-100 border border-transparent hover:bg-gray-200/70 focus:bg-white focus:border-accent-300 focus:ring-4 focus:ring-accent-100 focus:outline-none transition-all [&::-webkit-search-cancel-button]:hidden"
      />
      {value && (
        <button
          onClick={() => setValue('')}
          aria-label={t.common.clear}
          className="absolute inset-y-0 right-1 my-auto w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-200"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  )
}
