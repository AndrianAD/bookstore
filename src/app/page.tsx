import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import BookCard from '@/components/BookCard'
import FilterPanel from '@/components/FilterPanel'
import GenreChips from '@/components/GenreChips'
import MobileFilters from '@/components/MobileFilters'
import SiteHeader, { SiteFooter } from '@/components/SiteHeader'
import SortSelect from '@/components/SortSelect'
import { getTranslations } from '@/lib/i18n/server'
import { Book, isBookCondition } from '@/lib/types'

interface SearchParams {
  search?: string
  genre?: string
  condition?: string
  sort?: string
}

/** Characters that would break a PostgREST `or` filter expression. */
function toSearchPattern(term: string) {
  return `%${term.replace(/[,()%*\\]/g, ' ').trim()}%`
}

async function getBooks(filters: SearchParams): Promise<Book[]> {
  const supabase = await createClient()

  const sortMap: Record<string, { column: string; ascending: boolean }> = {
    newest:     { column: 'created_at', ascending: false },
    price_asc:  { column: 'price',      ascending: true },
    price_desc: { column: 'price',      ascending: false },
    title_asc:  { column: 'title',      ascending: true },
  }
  const { column, ascending } = sortMap[filters.sort ?? 'newest'] ?? sortMap.newest

  let query = supabase.from('books').select('*').order(column, { ascending })

  if (filters.search?.trim()) {
    const pattern = toSearchPattern(filters.search)
    query = query.or(`title.ilike.${pattern},author.ilike.${pattern}`)
  }
  if (filters.genre) query = query.eq('genre', filters.genre)
  if (isBookCondition(filters.condition)) query = query.eq('condition', filters.condition)

  const { data, error } = await query
  if (error) { console.error(error); return [] }
  return data || []
}

export default async function CatalogPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const filters = await searchParams
  const books = await getBooks(filters)
  const { t } = await getTranslations()

  return (
    <div className="min-h-screen">
      <SiteHeader t={t} />

      <main className="max-w-[1400px] mx-auto px-4 sm:px-6 pt-3 pb-6 lg:pt-6">
        <div className="flex gap-6">
          <Suspense fallback={<aside className="hidden lg:block w-64 shrink-0"><div className="bg-white rounded-2xl border border-gray-100 h-64 animate-pulse" /></aside>}>
            <FilterPanel />
          </Suspense>

          <div className="flex-1 min-w-0 space-y-3 lg:space-y-4">
            <Suspense fallback={<div className="lg:hidden h-8" />}>
              <GenreChips />
            </Suspense>

            <div className="flex items-center justify-between gap-2">
              <h1 className="flex items-baseline gap-2 min-w-0">
                <span className="sr-only sm:not-sr-only text-lg lg:text-xl font-bold text-gray-900">{t.catalog.title}</span>
                {books.length > 0 && (
                  <span className="text-[13px] text-gray-500 sm:text-gray-400 truncate">
                    {t.catalog.count(books.length)}
                  </span>
                )}
              </h1>
              <div className="flex items-center gap-2 shrink-0">
                <Suspense fallback={null}>
                  <MobileFilters resultsCount={books.length} />
                </Suspense>
                <Suspense fallback={null}>
                  <SortSelect />
                </Suspense>
              </div>
            </div>

            {books.length === 0 ? (
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
                {books.map((book) => (
                  <BookCard key={book.id} book={book} />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      <SiteFooter t={t} />
    </div>
  )
}
