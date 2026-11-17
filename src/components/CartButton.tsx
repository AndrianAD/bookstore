'use client'

import { useState } from 'react'
import { useCart } from '@/lib/cart'
import { useI18n } from '@/lib/i18n/client'
import CartDrawer from './CartDrawer'

export default function CartButton() {
  const [open, setOpen] = useState(false)
  const { count, mounted } = useCart()
  const { t } = useI18n()

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="relative flex items-center gap-2 h-10 min-w-10 px-2.5 sm:px-3 rounded-full text-gray-700 hover:bg-gray-100 hover:text-accent-600 transition-colors"
        aria-label={t.cart.title}
      >
        <svg className="w-[22px] h-[22px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
        <span className="hidden sm:inline text-sm font-medium">{t.cart.title}</span>
        {mounted && count > 0 && (
          <span className="absolute top-0.5 left-6 min-w-[18px] h-[18px] px-1 rounded-full bg-accent-500 text-white text-[11px] font-bold flex items-center justify-center ring-2 ring-white animate-fade-in">
            {count}
          </span>
        )}
      </button>

      <CartDrawer open={open} onClose={() => setOpen(false)} />
    </>
  )
}
