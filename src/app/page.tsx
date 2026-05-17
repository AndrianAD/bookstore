import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import BookCard from '@/components/BookCard'
import FilterPanel from '@/components/FilterPanel'
import SearchBar from '@/components/SearchBar'
import { Book } from '@/lib/types'

interface SearchParams {
  search?: string
  genre?: string
  minPrice?: string
  maxPrice?: string
  author?: string
}

async function getBooks(filters: SearchParams): Promise<Book[]> {
  const supabase = await createClient()
  let query = supabase.from('books').select('*').order('created_at', { ascending: false })

  if (filters.search) query = query.ilike('title', `%${filters.search}%`)
  if (filters.genre) query = query.eq('genre', filters.genre)
  if (filters.minPrice) query = query.gte('price', parseFloat(filters.minPrice))
  if (filters.maxPrice) query = query.lte('price', parseFloat(filters.maxPrice))
  if (filters.author) query = query.ilike('author', `%${filters.author}%`)

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

  return (
    <div className="min-h-screen bg-[#f8f6ff]">

      {/* ── HEADER ── */}
      <header className="sticky top-0 z-50 glass shadow-sm">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <a href="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-accent-500 to-accent-700 flex items-center justify-center shadow-glow-sm group-hover:shadow-glow transition-shadow">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <span className="text-lg font-bold text-gray-900 tracking-tight">Книжный мир</span>
            </a>

            {/* Nav */}
            <nav className="flex items-center gap-1">
              <a href="/admin" className="btn-ghost text-sm flex items-center gap-1.5">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Админка
              </a>
            </nav>
          </div>
        </div>
      </header>

      {/* ── HERO ── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#1a0533] via-[#2d1060] to-[#0f0a1e] py-8 px-4">
        {/* Decorative blobs */}
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-accent-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-purple-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-2xl mx-auto">
          <Suspense fallback={
            <div className="w-full py-4 px-5 rounded-2xl bg-white/20 text-white/40 text-base">
              Поиск по названию, автору...
            </div>
          }>
            <SearchBar />
          </Suspense>
        </div>
      </section>

      {/* ── CATALOG ── */}
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-10">
        <div className="flex flex-col lg:flex-row gap-8">
          <Suspense fallback={<aside className="w-full lg:w-72 shrink-0"><div className="bg-white rounded-2xl shadow-card p-6 h-64 animate-pulse" /></aside>}>
            <FilterPanel />
          </Suspense>

          <div className="flex-1 min-w-0">
            {/* Toolbar */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Каталог</h2>
                <p className="text-gray-400 text-sm mt-0.5">
                  {books.length === 0 ? 'Ничего не найдено' : `${books.length} книг`}
                </p>
              </div>
            </div>

            {books.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-card p-20 text-center">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-5">
                  <svg className="w-10 h-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-gray-700 mb-2">Ничего не найдено</h3>
                <p className="text-gray-400 text-sm">Попробуйте изменить параметры поиска</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-5">
                {books.map((book) => (
                  <BookCard key={book.id} book={book} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── FOOTER ── */}
      <footer className="border-t border-gray-200 bg-white mt-16">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-10">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-accent-500 to-accent-700 flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <span className="font-bold text-gray-900">Книжный мир</span>
            </div>
            <p className="text-sm text-gray-400">© 2024 Книжный мир. Все права защищены.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
