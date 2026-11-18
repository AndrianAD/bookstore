'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { updateCatalogUrl } from '@/lib/catalog-query'
import { useI18n } from '@/lib/i18n/client'

const DEBOUNCE_MS = 200

/**
 * On the catalog it filters in place; on any other page it opens the catalog with the term,
 * so the same header search works everywhere.
 */
export default function SearchBar() {
  const { t } = useI18n()
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const current = searchParams.get('search') ?? ''
  const [value, setValue] = useState(current)

  // Keep what the user typed (including a trailing space) unless the URL changed for another reason.
  useEffect(() => setValue((typed) => (typed.trim() === current ? typed : current)), [current])

  useEffect(() => {
    const term = value.trim()
    if (term === current) return
    const timer = setTimeout(() => {
      if (pathname === '/') updateCatalogUrl(searchParams, { search: term || null }, 'replace')
      else router.push(term ? `/?search=${encodeURIComponent(term)}` : '/')
    }, DEBOUNCE_MS)
    return () => clearTimeout(timer)
  }, [value, current, pathname, router, searchParams])

  return (
    <div className="relative group">
      <div className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none">
        <svg className="w-4 h-4 text-gray-400 group-focus-within:text-accent-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
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
