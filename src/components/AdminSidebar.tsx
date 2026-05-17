'use client'

interface AdminSidebarProps {
  userEmail: string
  onLogout: () => void
  booksCount?: number
  ordersCount?: number
  active: 'books' | 'orders'
}

export default function AdminSidebar({
  userEmail,
  onLogout,
  booksCount,
  ordersCount,
  active,
}: AdminSidebarProps) {
  return (
    <aside className="hidden lg:flex flex-col w-64 min-h-screen bg-gradient-to-b from-[#1a0533] to-[#2d1060] fixed left-0 top-0 bottom-0 z-20">
      <div className="p-6 border-b border-white/10">
        <a href="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <div>
            <div className="text-white font-bold text-sm">Книжный мир</div>
            <div className="text-white/40 text-xs">Управление</div>
          </div>
        </a>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        <div className="text-white/30 text-xs font-semibold uppercase tracking-wider px-3 mb-3">Каталог</div>

        <a
          href="/admin"
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
            active === 'books'
              ? 'bg-white/15 text-white'
              : 'text-white/50 hover:text-white hover:bg-white/10'
          }`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
          Книги
          {booksCount !== undefined && (
            <span className={`ml-auto text-xs px-2 py-0.5 rounded-full ${active === 'books' ? 'bg-accent-500/60 text-white' : 'bg-white/10 text-white/60'}`}>
              {booksCount}
            </span>
          )}
        </a>

        <a
          href="/admin/orders"
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
            active === 'orders'
              ? 'bg-white/15 text-white'
              : 'text-white/50 hover:text-white hover:bg-white/10'
          }`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          Заказы
          {ordersCount !== undefined && ordersCount > 0 && (
            <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-red-500 text-white animate-pulse">
              {ordersCount}
            </span>
          )}
        </a>

        <div className="pt-3 mt-3 border-t border-white/10">
          <a href="/" className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-white/50 hover:text-white hover:bg-white/10 text-sm font-medium transition-all">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            В магазин
          </a>
        </div>
      </nav>

      <div className="p-4 border-t border-white/10">
        <div className="flex items-center gap-3 px-3 py-2 mb-2">
          <div className="w-8 h-8 rounded-full bg-accent-500/60 flex items-center justify-center text-white text-sm font-bold shrink-0">
            {userEmail?.[0]?.toUpperCase() || 'A'}
          </div>
          <div className="min-w-0">
            <div className="text-white text-xs font-medium truncate">{userEmail}</div>
            <div className="text-white/40 text-xs">Администратор</div>
          </div>
        </div>
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-white/50 hover:text-red-400 hover:bg-red-500/10 text-sm transition-all"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Выйти
        </button>
      </div>
    </aside>
  )
}
