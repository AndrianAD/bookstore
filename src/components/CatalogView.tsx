'use client'

import { useSearchParams } from 'next/navigation'
import { useMemo } from 'react'
import { applyCatalogQuery, readCatalogQuery } from '@/lib/catalog-query'
import { useI18n } from '@/lib/i18n/client'
import { Book } from '@/lib/types'
import BookCard from './BookCard'
import GenreChips from './GenreChips'
import MobileFilters from './MobileFilters'
import SortSelect from './SortSelect'

/** The catalog grid with its toolbar; everything is derived from the URL, so it updates instantly. */
export default function CatalogView({ books }: { books: Book[] }) {
  const { t } = useI18n()
  const searchParams = useSearchParams()
  const visible = useMemo(() => applyCatalogQuery(books, readCatalogQuery(searchParams)), [books, searchParams])

  return (
    <div className="flex-1 min-w-0 space-y-3 lg:space-y-4">
      <GenreChips />

      <div className="flex items-center justify-between gap-2">
        <h1 className="flex items-baseline gap-2 min-w-0">
          <span className="sr-only sm:not-sr-only text-lg lg:text-xl font-bold text-gray-900">{t.catalog.title}</span>
          {visible.length > 0 && (
            <span className="text-[13px] text-gray-500 sm:text-gray-400 truncate">{t.catalog.count(visible.length)}</span>
          )}
        </h1>
        <div className="flex items-center gap-2 shrink-0">
          <MobileFilters resultsCount={visible.length} />
          <SortSelect />
        </div>
      </div>

      {visible.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 px-6 py-14 text-center">
          <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <h2 className="text-base font-semibold text-gray-800 mb-1">{t.catalog.empty}</h2>
          <p className="text-gray-400 text-sm">{t.catalog.emptyHint}</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 sm:gap-4">
          {visible.map((book) => (
            <BookCard key={book.id} book={book} />
          ))}
        </div>
      )}
    </div>
  )
}
