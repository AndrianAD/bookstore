'use client'

import { useState } from 'react'
import { Book, stockOf } from '@/lib/types'
import { useCart } from '@/lib/cart'
import { useI18n } from '@/lib/i18n/client'

interface Props {
  book: Book
}

export default function BookDetailActions({ book }: Props) {
  const { add } = useCart()
  const { t } = useI18n()
  const stock = stockOf(book)
  const [quantity, setQuantity] = useState(1)
  const [added, setAdded] = useState(false)

  const handleAdd = () => {
    add(book, quantity)
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  if (stock === 0) {
    return (
      <button disabled className="w-full h-12 rounded-full font-semibold text-[15px] bg-gray-100 text-gray-400 cursor-not-allowed">
        {t.book.outOfStock}
      </button>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <div role="group" aria-label={t.book.quantity} className="flex items-center h-12 rounded-full bg-gray-100 shrink-0">
        <button
          onClick={() => setQuantity(Math.max(1, quantity - 1))}
          disabled={quantity <= 1}
          className="w-11 h-12 rounded-full text-lg text-gray-600 hover:text-gray-900 transition-colors disabled:opacity-30"
        >
          −
        </button>
        <span className="w-6 text-center font-semibold text-gray-900 tabular-nums">{quantity}</span>
        <button
          onClick={() => setQuantity(Math.min(stock, quantity + 1))}
          disabled={quantity >= stock}
          className="w-11 h-12 rounded-full text-lg text-gray-600 hover:text-gray-900 transition-colors disabled:opacity-30"
        >
          +
        </button>
      </div>

      <button
        onClick={handleAdd}
        className={`flex-1 h-12 rounded-full font-semibold text-[15px] transition-all active:scale-[0.98] flex items-center justify-center gap-2 ${
          added ? 'bg-emerald-500 text-white' : 'bg-accent-600 hover:bg-accent-700 text-white'
        }`}
      >
        {added ? (
          <>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
            {t.book.addedToCart}
          </>
        ) : (
          <>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            {t.book.addToCart}
          </>
        )}
      </button>
    </div>
  )
}
