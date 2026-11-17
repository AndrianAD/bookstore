'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useCart } from '@/lib/cart'
import { genreGradient } from '@/lib/genre-style'
import { genreLabel } from '@/lib/i18n'
import { useI18n } from '@/lib/i18n/client'
import { currencySymbol, formatAmount } from '@/lib/money'
import { Book, CONDITION_BADGES, conditionOf, isInStock } from '@/lib/types'

interface BookCardProps {
  book: Book
}

export default function BookCard({ book }: BookCardProps) {
  const { t } = useI18n()
  const { add, items } = useCart()
  const condition = conditionOf(book)
  const sold = !isInStock(book)
  const inCart = items.some((i) => i.id === book.id)

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    add(book)
  }

  return (
    <Link
      href={`/book/${book.id}`}
      className="group flex flex-col bg-white rounded-2xl border border-gray-100 overflow-hidden transition-shadow duration-200 hover:shadow-card"
    >
      <div className="relative aspect-[3/4] overflow-hidden bg-gray-100">
        {book.image_url ? (
          <Image
            src={book.image_url}
            alt={book.title}
            fill
            className={`object-cover transition-transform duration-500 group-hover:scale-[1.03] ${sold ? 'grayscale opacity-60' : ''}`}
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
          />
        ) : (
          <div className={`absolute inset-0 bg-gradient-to-br ${genreGradient(book.genre)} flex flex-col items-center justify-center p-4 ${sold ? 'grayscale opacity-60' : ''}`}>
            <div className="absolute left-0 inset-y-0 w-2 bg-black/15" />
            <p className="text-white font-bold text-sm text-center leading-tight line-clamp-4 drop-shadow-sm">{book.title}</p>
            <p className="text-white/75 text-xs mt-2 text-center line-clamp-1">{book.author}</p>
          </div>
        )}

        {sold ? (
          <span className="absolute top-2 left-2 badge bg-gray-900/85 text-white">{t.book.sold}</span>
        ) : condition === 'used' ? (
          <span className={`absolute top-2 left-2 badge ${CONDITION_BADGES.used}`}>{t.conditions.used}</span>
        ) : null}
      </div>

      <div className="flex flex-col flex-1 p-3 sm:p-3.5">
        <p className="text-[11px] font-medium uppercase tracking-wide text-accent-600 truncate">
          {genreLabel(t, book.genre)}
        </p>
        <h3 className="mt-0.5 text-sm font-semibold text-gray-900 leading-snug line-clamp-2 group-hover:text-accent-700 transition-colors">
          {book.title}
        </h3>
        <p className="mt-0.5 text-xs text-gray-500 truncate">{book.author}</p>

        <div className="mt-auto pt-2.5 flex items-center justify-between gap-2">
          <p className={`whitespace-nowrap ${sold ? 'text-gray-400' : 'text-gray-900'}`}>
            <span className="text-base sm:text-lg font-bold">{formatAmount(book.price)}</span>
            <span className="text-sm ml-0.5">{currencySymbol(book.currency)}</span>
          </p>
          {!sold && (
            <button
              onClick={handleAdd}
              aria-label={inCart ? t.book.addedToCart : t.book.toCart}
              title={inCart ? t.book.addedToCart : t.book.toCart}
              className={`w-10 h-10 shrink-0 rounded-full flex items-center justify-center transition-all active:scale-90 ${
                inCart ? 'bg-emerald-500 text-white' : 'bg-accent-600 text-white hover:bg-accent-700'
              }`}
            >
              {inCart ? (
                <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              )}
            </button>
          )}
        </div>
      </div>
    </Link>
  )
}
