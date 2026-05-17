'use client'

import { useState } from 'react'
import { Book } from '@/lib/types'
import { useCart } from '@/lib/cart'

interface Props {
  book: Book
}

export default function BookDetailActions({ book }: Props) {
  const { add } = useCart()
  const [quantity, setQuantity] = useState(1)
  const [added, setAdded] = useState(false)

  const handleAdd = () => {
    for (let i = 0; i < quantity; i++) add(book)
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  return (
    <div className="space-y-3">
      {/* Quantity */}
      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-500">Количество:</span>
        <div className="flex items-center bg-gray-100 rounded-xl">
          <button
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            className="w-9 h-9 rounded-xl text-gray-600 hover:bg-gray-200 transition-colors flex items-center justify-center font-semibold"
          >
            −
          </button>
          <span className="w-10 text-center font-semibold text-gray-900">{quantity}</span>
          <button
            onClick={() => setQuantity(quantity + 1)}
            className="w-9 h-9 rounded-xl text-gray-600 hover:bg-gray-200 transition-colors flex items-center justify-center font-semibold"
          >
            +
          </button>
        </div>
      </div>

      <button
        onClick={handleAdd}
        className={`w-full py-3.5 rounded-xl font-bold text-base transition-all duration-200 active:scale-[0.98] flex items-center justify-center gap-2 ${
          added
            ? 'bg-emerald-500 text-white'
            : 'bg-gradient-to-r from-accent-600 to-accent-500 hover:from-accent-700 hover:to-accent-600 text-white shadow-lg hover:shadow-glow'
        }`}
      >
        {added ? (
          <>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
            Добавлено в корзину
          </>
        ) : (
          <>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            Добавить в корзину
          </>
        )}
      </button>
    </div>
  )
}
