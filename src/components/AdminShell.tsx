'use client'

import Link from 'next/link'
import { useI18n } from '@/lib/i18n/client'
import LanguageSwitcher from './LanguageSwitcher'
import { BrandMark } from './SiteHeader'

type Section = 'books' | 'orders'

interface AdminShellProps {
  active: Section
  userEmail: string
  onLogout: () => void
  booksCount?: number
  newOrdersCount?: number
  title: string
  subtitle?: string
  /** Buttons shown next to the page title. */
  actions?: React.ReactNode
  children: React.ReactNode
}

const ICONS = {
  books: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253',
  orders: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2',
  shop: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
  logout: 'M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1',
}

function Icon({ d, className = 'w-5 h-5' }: { d: string; className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d={d} />
    </svg>
  )
}

function CountBadge({ count, urgent = false }: { count?: number; urgent?: boolean }) {
  if (!count) return null
  return (
    <span className={`min-w-5 h-5 px-1.5 rounded-full text-[11px] font-semibold flex items-center justify-center ${
      urgent ? 'bg-accent-600 text-white' : 'bg-gray-100 text-gray-500'
    }`}>
      {count}
    </span>
  )
}

export default function AdminShell({
  active, userEmail, onLogout, booksCount, newOrdersCount, title, subtitle, actions, children,
}: AdminShellProps) {
  const { t } = useI18n()

  const nav = [
    { key: 'books' as const, href: '/admin', label: t.admin.books, count: booksCount, urgent: false },
    { key: 'orders' as const, href: '/admin/orders', label: t.admin.orders, count: newOrdersCount, urgent: true },
  ]

  return (
    <div className="min-h-screen lg:pl-60">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col fixed inset-y-0 left-0 w-60 bg-white border-r border-gray-100 z-20">
        <Link href="/" className="flex items-center gap-2.5 px-5 h-16 border-b border-gray-100">
          <BrandMark />
          <div className="min-w-0">
            <div className="text-sm font-bold text-gray-900 truncate">{t.brand.name}</div>
            <div className="text-xs text-gray-400">{t.admin.management}</div>
          </div>
        </Link>

        <nav className="flex-1 p-3 space-y-0.5">
          {nav.map((item) => (
            <Link
              key={item.key}
              href={item.href}
              className={`flex items-center gap-3 h-10 px-3 rounded-xl text-sm font-medium transition-colors ${
                active === item.key ? 'bg-accent-50 text-accent-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <Icon d={ICONS[item.key]} className="w-[18px] h-[18px]" />
              <span className="flex-1">{item.label}</span>
              <CountBadge count={item.count} urgent={item.urgent} />
            </Link>
          ))}
          <Link
            href="/"
            className="flex items-center gap-3 h-10 px-3 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
          >
            <Icon d={ICONS.shop} className="w-[18px] h-[18px]" />
            {t.admin.toShop}
          </Link>
        </nav>

        <div className="p-4 space-y-4 border-t border-gray-100">
          <LanguageSwitcher />
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-accent-100 text-accent-700 flex items-center justify-center text-sm font-semibold shrink-0">
              {userEmail?.[0]?.toUpperCase() || 'A'}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-medium text-gray-900 truncate">{userEmail}</div>
              <div className="text-xs text-gray-400">{t.admin.role}</div>
            </div>
            <button
              onClick={onLogout}
              title={t.common.logout}
              aria-label={t.common.logout}
              className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
            >
              <Icon d={ICONS.logout} className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="lg:hidden sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-gray-100">
        <div className="flex items-center gap-2 h-14 px-4">
          <Link href="/" className="flex items-center gap-2 min-w-0 mr-auto">
            <BrandMark />
            <span className="text-[15px] font-bold text-gray-900 truncate">{t.admin.management}</span>
          </Link>
          <LanguageSwitcher compact />
          <button
            onClick={onLogout}
            aria-label={t.common.logout}
            className="w-10 h-10 rounded-full flex items-center justify-center text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors"
          >
            <Icon d={ICONS.logout} />
          </button>
        </div>
      </div>

      <main className="pb-24 lg:pb-10">
        <header className="lg:sticky lg:top-0 lg:z-10 lg:bg-[#f7f7f9]/90 lg:backdrop-blur-md px-4 sm:px-6 lg:px-8 pt-4 pb-3 lg:pt-6 lg:pb-4 flex flex-wrap items-center gap-3">
          <div className="min-w-0 mr-auto">
            <h1 className="text-xl lg:text-2xl font-bold text-gray-900">{title}</h1>
            {subtitle && <p className="text-[13px] text-gray-500 mt-0.5">{subtitle}</p>}
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </header>
        <div className="px-4 sm:px-6 lg:px-8">{children}</div>
      </main>

      {/* Mobile bottom navigation */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-30 bg-white/95 backdrop-blur-md border-t border-gray-100 pb-[env(safe-area-inset-bottom)]">
        <div className="grid grid-cols-3 h-16">
          {[...nav, { key: 'shop' as const, href: '/', label: t.admin.toShop, count: undefined, urgent: false }].map((item) => {
            const isActive = item.key === active
            return (
              <Link
                key={item.key}
                href={item.href}
                className={`relative flex flex-col items-center justify-center gap-1 text-[11px] font-medium ${
                  isActive ? 'text-accent-700' : 'text-gray-500'
                }`}
              >
                <span className={`flex items-center justify-center w-14 h-7 rounded-full ${isActive ? 'bg-accent-50' : ''}`}>
                  <Icon d={ICONS[item.key]} />
                </span>
                {item.label}
                {item.urgent && !!item.count && (
                  <span className="absolute top-1.5 left-1/2 ml-3 min-w-4 h-4 px-1 rounded-full bg-accent-600 text-white text-[10px] font-semibold flex items-center justify-center">
                    {item.count}
                  </span>
                )}
              </Link>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
