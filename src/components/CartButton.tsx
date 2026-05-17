'use client'

import { useState } from 'react'
import { useCart } from '@/lib/cart'
import CartDrawer from './CartDrawer'

export default function CartButton() {
  const [open, setOpen] = useState(false)
  const { count, mounted } = useCart()

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="relative flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-gray-100 transition-all group"
        aria-label="Корзина"
      >
        <svg className="w-5 h-5 text-gray-700 group-hover:text-accent-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
        <span className="text-sm font-medium text-gray-700">Корзина</span>
        {mounted && count > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1.5 rounded-full bg-accent-500 text-white text-xs font-bold flex items-center justify-center shadow-glow-sm animate-fade-in">
            {count}
          </span>
        )}
      </button>

      <CartDrawer open={open} onClose={() => setOpen(false)} />
    </>
  )
}
