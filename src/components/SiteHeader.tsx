import { Suspense } from 'react'
import Link from 'next/link'
import type { Dictionary } from '@/lib/i18n'
import CartButton from './CartButton'
import SearchBar from './SearchBar'

export function BrandMark({ className = 'w-8 h-8' }: { className?: string }) {
  return (
    <div className={`${className} rounded-[10px] bg-gradient-to-br from-accent-500 to-accent-700 flex items-center justify-center shrink-0`}>
      <svg className="w-[55%] h-[55%] text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    </div>
  )
}

/**
 * Sticky header shared by the storefront pages. On phones the search sits on its own row
 * below the logo; from `md` up it moves into the same row.
 */
export default function SiteHeader({ t }: { t: Dictionary }) {
  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-2 md:py-3 flex flex-wrap md:flex-nowrap items-center gap-x-4 gap-y-2">
        <Link href="/" className="flex items-center gap-2 min-w-0 order-1">
          <BrandMark />
          <span className="text-[17px] font-bold text-gray-900 tracking-tight truncate">{t.brand.name}</span>
        </Link>

        <div className="order-3 md:order-2 w-full md:w-auto md:flex-1 md:max-w-xl md:mx-auto">
          <Suspense fallback={<div className="h-10 rounded-full bg-gray-100" />}>
            <SearchBar />
          </Suspense>
        </div>

        <nav className="order-2 md:order-3 ml-auto md:ml-0 flex items-center gap-1">
          <a
            href="/admin"
            className="hidden md:flex items-center gap-1.5 h-10 px-3 rounded-full text-sm font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
          >
            {t.catalog.adminLink}
          </a>
          <CartButton />
        </nav>
      </div>
    </header>
  )
}

export function SiteFooter({ t }: { t: Dictionary }) {
  return (
    <footer className="border-t border-gray-100 bg-white mt-10">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <BrandMark className="w-6 h-6" />
          <span className="text-sm font-semibold text-gray-900">{t.brand.name}</span>
        </div>
        <p className="text-xs text-gray-400">{t.brand.rights(new Date().getFullYear())}</p>
      </div>
    </footer>
  )
}
