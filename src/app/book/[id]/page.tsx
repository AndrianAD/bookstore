import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Book } from '@/lib/types'
import CartButton from '@/components/CartButton'
import BookDetailActions from '@/components/BookDetailActions'

const GENRE_COLORS: Record<string, string> = {
  'Роман': 'from-rose-400 to-pink-600',
  'Детектив': 'from-slate-500 to-gray-700',
  'Фантастика': 'from-blue-400 to-indigo-600',
  'Фэнтези': 'from-violet-400 to-purple-600',
  'Биография': 'from-amber-400 to-orange-500',
  'История': 'from-stone-400 to-stone-600',
  'Наука': 'from-cyan-400 to-teal-600',
  'Психология': 'from-emerald-400 to-green-600',
  'Бизнес': 'from-blue-500 to-cyan-600',
  'Поэзия': 'from-fuchsia-400 to-pink-500',
  'Классика': 'from-amber-500 to-yellow-600',
  'Приключения': 'from-orange-400 to-red-500',
  'Ужасы': 'from-gray-700 to-gray-900',
  'Юмор': 'from-yellow-400 to-orange-400',
  'Другое': 'from-accent-400 to-accent-600',
}

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

export default async function BookDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const book = await getBook(id)
  if (!book) notFound()

  const related = await getRelated(book.genre, book.id)
  const gradientClass = GENRE_COLORS[book.genre] ?? GENRE_COLORS['Другое']

  return (
    <div className="min-h-screen bg-[#f8f6ff]">
      {/* Header */}
      <header className="sticky top-0 z-50 glass shadow-sm">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-accent-500 to-accent-700 flex items-center justify-center shadow-glow-sm">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <span className="text-lg font-bold text-gray-900">Книжный мир</span>
            </Link>
            <CartButton />
          </div>
        </div>
      </header>

      {/* Breadcrumb */}
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 pt-6">
        <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-accent-600 transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Назад в каталог
        </Link>
      </div>

      {/* Main */}
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-8">
        <div className="grid md:grid-cols-[400px_1fr] lg:grid-cols-[480px_1fr] gap-8 lg:gap-12">
          {/* Cover */}
          <div className="md:sticky md:top-24 md:self-start">
            <div className="relative aspect-[2/3] rounded-3xl overflow-hidden shadow-2xl">
              {book.image_url ? (
                <Image
                  src={book.image_url}
                  alt={book.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 480px"
                  priority
                />
              ) : (
                <div className={`absolute inset-0 bg-gradient-to-br ${gradientClass} flex flex-col items-center justify-center p-8`}>
                  <div className="absolute left-0 top-0 bottom-0 w-5 bg-black/20" />
                  <div className="relative z-10 text-center">
                    <div className="text-white/30 text-8xl mb-6 font-serif">"</div>
                    <p className="text-white font-bold text-2xl leading-tight">{book.title}</p>
                    <p className="text-white/70 text-sm mt-4 font-medium">{book.author}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Info */}
          <div className="space-y-6">
            <div>
              <span className="badge bg-accent-100 text-accent-700 mb-3">{book.genre}</span>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 leading-tight mb-3">
                {book.title}
              </h1>
              <p className="text-lg text-gray-500">
                <span className="text-gray-400">Автор:</span> <span className="font-semibold text-gray-700">{book.author}</span>
              </p>
            </div>

            {/* Price + CTA */}
            <div className="bg-white rounded-3xl shadow-card p-6">
              <div className="flex items-baseline gap-3 mb-5">
                <span className="text-4xl font-extrabold text-gray-900">
                  {book.price.toLocaleString('ru-RU')}
                </span>
                <span className="text-2xl text-gray-500">€</span>
                <span className="ml-auto text-sm text-emerald-600 font-semibold flex items-center gap-1">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full" />
                  В наличии
                </span>
              </div>

              <BookDetailActions book={book} />

              <div className="grid grid-cols-3 gap-3 mt-6 pt-6 border-t border-gray-100">
                <div className="flex flex-col items-center text-center gap-1.5">
                  <svg className="w-5 h-5 text-accent-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
                  </svg>
                  <span className="text-xs text-gray-500">Доставка<br/>1–3 дня</span>
                </div>
                <div className="flex flex-col items-center text-center gap-1.5">
                  <svg className="w-5 h-5 text-accent-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  <span className="text-xs text-gray-500">Гарантия<br/>возврата</span>
                </div>
                <div className="flex flex-col items-center text-center gap-1.5">
                  <svg className="w-5 h-5 text-accent-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <span className="text-xs text-gray-500">Поддержка<br/>24/7</span>
                </div>
              </div>
            </div>

            {/* Description */}
            {book.description && (
              <div className="bg-white rounded-3xl shadow-card p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-accent-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                  </svg>
                  Описание
                </h2>
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                  {book.description}
                </p>
              </div>
            )}

            {/* Specs */}
            <div className="bg-white rounded-3xl shadow-card p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-accent-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
                Характеристики
              </h2>
              <dl className="divide-y divide-gray-100">
                <div className="flex items-center justify-between py-3">
                  <dt className="text-sm text-gray-500">Автор</dt>
                  <dd className="text-sm font-semibold text-gray-900">{book.author}</dd>
                </div>
                <div className="flex items-center justify-between py-3">
                  <dt className="text-sm text-gray-500">Жанр</dt>
                  <dd className="text-sm font-semibold text-gray-900">{book.genre}</dd>
                </div>
                <div className="flex items-center justify-between py-3">
                  <dt className="text-sm text-gray-500">Цена</dt>
                  <dd className="text-sm font-semibold text-gray-900">{book.price.toLocaleString('ru-RU')} €</dd>
                </div>
              </dl>
            </div>
          </div>
        </div>

        {/* Related */}
        {related.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-extrabold text-gray-900 mb-6">Похожие книги</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5">
              {related.map((b) => {
                const grad = GENRE_COLORS[b.genre] ?? GENRE_COLORS['Другое']
                return (
                  <Link
                    key={b.id}
                    href={`/book/${b.id}`}
                    className="group flex flex-col bg-white rounded-2xl overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1"
                  >
                    <div className="relative aspect-[2/3] overflow-hidden">
                      {b.image_url ? (
                        <Image src={b.image_url} alt={b.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" sizes="200px" />
                      ) : (
                        <div className={`absolute inset-0 bg-gradient-to-br ${grad} flex items-center justify-center p-4`}>
                          <div className="absolute left-0 top-0 bottom-0 w-3 bg-black/20" />
                          <div className="text-center">
                            <p className="text-white font-bold text-xs line-clamp-3">{b.title}</p>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-sm text-gray-900 line-clamp-2 group-hover:text-accent-600 transition-colors">{b.title}</h3>
                      <p className="text-xs text-gray-400 mt-0.5">{b.author}</p>
                      <p className="font-bold text-gray-900 mt-2">
                        {b.price.toLocaleString('ru-RU')} <span className="text-sm text-gray-500">€</span>
                      </p>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
