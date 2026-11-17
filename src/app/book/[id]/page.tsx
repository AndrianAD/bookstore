import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import BookCard from '@/components/BookCard'
import BookDetailActions from '@/components/BookDetailActions'
import SiteHeader, { SiteFooter } from '@/components/SiteHeader'
import { genreGradient } from '@/lib/genre-style'
import { genreLabel } from '@/lib/i18n'
import { getTranslations } from '@/lib/i18n/server'
import { currencySymbol, formatAmount, formatPrice } from '@/lib/money'
import { createClient } from '@/lib/supabase/server'
import { Book, CONDITION_BADGES, conditionOf, isInStock } from '@/lib/types'

async function getBook(id: string): Promise<Book | null> {
  const supabase = await createClient()
  const { data } = await supabase.from('books').select('*').eq('id', id).single()
  return data
}

async function getRelated(genre: string, excludeId: string): Promise<Book[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('books')
    .select('*')
    .eq('genre', genre)
    .neq('id', excludeId)
    .limit(4)
  return data || []
}

const PERK_ICONS = {
  delivery: 'M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0zM13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1',
  returns: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
  support: 'M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z',
} as const

export default async function BookDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const book = await getBook(id)
  if (!book) notFound()

  const related = await getRelated(book.genre, book.id)
  const condition = conditionOf(book)
  const inStock = isInStock(book)
  const { t } = await getTranslations()
  const genre = genreLabel(t, book.genre)

  return (
    <div className="min-h-screen">
      <SiteHeader t={t} />

      <main className="max-w-[1400px] mx-auto px-4 sm:px-6 pt-3 pb-6 lg:pt-6">
        <Link href="/" className="inline-flex items-center gap-1 h-8 -ml-1 px-1 text-sm text-gray-500 hover:text-accent-600 transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          {t.catalog.backToCatalog}
        </Link>

        <div className="mt-2 grid md:grid-cols-[minmax(0,340px)_1fr] lg:grid-cols-[minmax(0,420px)_1fr] gap-5 md:gap-8 lg:gap-12">
          <div className="md:sticky md:top-24 md:self-start">
            <div className="relative aspect-[3/4] w-full max-w-[260px] md:max-w-none mx-auto rounded-2xl overflow-hidden bg-gray-100 shadow-card">
              {book.image_url ? (
                <Image
                  src={book.image_url}
                  alt={book.title}
                  fill
                  className={`object-cover ${inStock ? '' : 'grayscale opacity-70'}`}
                  sizes="(max-width: 768px) 260px, 420px"
                  priority
                />
              ) : (
                <div className={`absolute inset-0 bg-gradient-to-br ${genreGradient(book.genre)} flex flex-col items-center justify-center p-6 text-center`}>
                  <div className="absolute left-0 inset-y-0 w-3 bg-black/15" />
                  <p className="text-white font-bold text-xl leading-tight">{book.title}</p>
                  <p className="text-white/75 text-sm mt-3">{book.author}</p>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4 min-w-0">
            <div>
              <div className="flex flex-wrap gap-1.5 mb-2">
                <span className={`badge ${CONDITION_BADGES[condition]}`}>{t.conditions[condition]}</span>
                <span className="badge bg-accent-50 text-accent-700">{genre}</span>
              </div>
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 leading-tight">{book.title}</h1>
              <p className="mt-1 text-[15px] text-gray-500">{book.author}</p>
            </div>

            <section className="bg-white rounded-2xl border border-gray-100 p-4 md:p-5">
              <div className="flex items-baseline gap-1.5 mb-4">
                <span className="text-3xl font-bold text-gray-900">{formatAmount(book.price)}</span>
                <span className="text-xl text-gray-500">{currencySymbol(book.currency)}</span>
                <span className={`ml-auto text-[13px] font-medium flex items-center gap-1.5 ${inStock ? 'text-emerald-600' : 'text-gray-400'}`}>
                  <span className={`w-2 h-2 rounded-full ${inStock ? 'bg-emerald-500' : 'bg-gray-300'}`} />
                  {inStock ? t.book.inStock : t.book.outOfStock}
                </span>
              </div>

              <BookDetailActions book={book} />

              <ul className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-gray-100">
                {(['delivery', 'returns', 'support'] as const).map((perk) => (
                  <li key={perk} className="flex flex-col items-center text-center gap-1">
                    <svg className="w-5 h-5 text-accent-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d={PERK_ICONS[perk]} />
                    </svg>
                    <span className="text-[11px] leading-tight text-gray-500">{t.book[perk][0]}<br />{t.book[perk][1]}</span>
                  </li>
                ))}
              </ul>
            </section>

            {book.description && (
              <section className="bg-white rounded-2xl border border-gray-100 p-4 md:p-5">
                <h2 className="text-base font-semibold text-gray-900 mb-2">{t.book.description}</h2>
                <p className="text-[15px] text-gray-700 leading-relaxed whitespace-pre-line">{book.description}</p>
              </section>
            )}

            <section className="bg-white rounded-2xl border border-gray-100 px-4 md:px-5 py-2">
              <h2 className="sr-only">{t.book.specs}</h2>
              <dl className="divide-y divide-gray-100 text-sm">
                {[
                  [t.book.author, book.author],
                  [t.book.genre, genre],
                  [t.book.condition, t.conditions[condition]],
                  [t.book.price, formatPrice(book.price, book.currency)],
                ].map(([label, value]) => (
                  <div key={label} className="flex items-center justify-between gap-4 py-2.5">
                    <dt className="text-gray-500">{label}</dt>
                    <dd className="font-medium text-gray-900 text-right">{value}</dd>
                  </div>
                ))}
              </dl>
            </section>
          </div>
        </div>

        {related.length > 0 && (
          <section className="mt-10">
            <h2 className="text-lg lg:text-xl font-bold text-gray-900 mb-3">{t.book.related}</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
              {related.map((b) => (
                <BookCard key={b.id} book={b} />
              ))}
            </div>
          </section>
        )}
      </main>

      <SiteFooter t={t} />
    </div>
  )
}
