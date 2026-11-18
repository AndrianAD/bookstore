'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { LOCALES } from '@/lib/i18n'
import { useI18n } from '@/lib/i18n/client'
import { formatPrice, formatTotals, lineTotal } from '@/lib/money'
import { createClient } from '@/lib/supabase/client'
import { ORDER_STATUS_CODES, ORDER_STATUS_COLORS, Order, OrderStatus } from '@/lib/types'
import AdminShell from '@/components/AdminShell'
import Drawer from '@/components/Drawer'

/** Customers without a username are stored by numeric id, which only the tg:// scheme can open. */
function telegramProfileUrl(handle: string) {
  return handle.startsWith('@') ? `https://t.me/${handle.slice(1)}` : `tg://user?id=${handle}`
}

const PHONE_ICON = 'M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z'

export default function OrdersPage() {
  const router = useRouter()
  const { locale, t } = useI18n()
  const dateLocale = LOCALES[locale].intl
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [userEmail, setUserEmail] = useState('')
  const [selected, setSelected] = useState<Order | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all')

  const supabase = createClient()

  const fetchOrders = useCallback(async () => {
    const { data } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })
    setOrders((data as Order[]) || [])
    setLoading(false)
  }, [supabase])

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { router.push('/admin/login'); return }
      setUserEmail(user.email || '')
    })
    fetchOrders()
  }, [fetchOrders, router, supabase.auth])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/admin/login')
  }

  const openOrder = (order: Order) => {
    setSelected(order)
    setDrawerOpen(true)
  }
  const closeOrder = useCallback(() => setDrawerOpen(false), [])

  const updateStatus = async (id: string, status: OrderStatus) => {
    const { error } = await supabase.from('orders').update({ status }).eq('id', id)
    if (error) { alert(t.common.error(error.message)); return }
    fetchOrders()
    setSelected((current) => (current?.id === id ? { ...current, status } : current))
  }

  const handleDelete = async (id: string) => {
    if (!confirm(t.orders.confirmDelete)) return
    const { error } = await supabase.from('orders').delete().eq('id', id)
    if (error) { alert(t.common.error(error.message)); return }
    fetchOrders()
    closeOrder()
  }

  const filtered = statusFilter === 'all' ? orders : orders.filter((o) => o.status === statusFilter)
  const countFor = (status: OrderStatus | 'all') =>
    status === 'all' ? orders.length : orders.filter((o) => o.status === status).length

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleString(dateLocale, { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })

  return (
    <AdminShell
      active="orders"
      userEmail={userEmail}
      onLogout={handleLogout}
      newOrdersCount={countFor('new')}
      title={t.orders.title}
      subtitle={loading ? undefined : t.orders.totalCount(orders.length)}
    >
      <div className="-mx-4 sm:mx-0 mb-3 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="flex gap-2 px-4 sm:px-0 w-max">
          {(['all', ...ORDER_STATUS_CODES] as const).map((key) => {
            const isActive = statusFilter === key
            return (
              <button
                key={key}
                onClick={() => setStatusFilter(key)}
                aria-pressed={isActive}
                className={`flex items-center gap-1.5 h-8 px-3.5 rounded-full text-[13px] font-medium whitespace-nowrap border transition-colors ${
                  isActive ? 'bg-gray-900 border-gray-900 text-white' : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300'
                }`}
              >
                {key === 'all' ? t.common.all : t.orderStatuses[key]}
                <span className={`text-[11px] ${isActive ? 'text-white/70' : 'text-gray-400'}`}>{countFor(key)}</span>
              </button>
            )
          })}
        </div>
      </div>

      {loading ? (
        <div className="bg-white rounded-2xl border border-gray-100 divide-y divide-gray-100">
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i} className="p-4 space-y-2">
              <div className="h-3.5 w-1/2 rounded bg-gray-100 animate-pulse" />
              <div className="h-3 w-1/3 rounded bg-gray-100 animate-pulse" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 px-6 py-14 text-center">
          <h3 className="text-base font-semibold text-gray-800 mb-1">{t.orders.empty}</h3>
          <p className="text-gray-400 text-sm">{t.orders.emptyHint}</p>
        </div>
      ) : (
        <ul className="bg-white rounded-2xl border border-gray-100 divide-y divide-gray-100 overflow-hidden">
          {filtered.map((order) => {
            const itemsCount = order.items.reduce((s, i) => s + i.quantity, 0)
            return (
              <li key={order.id}>
                <button
                  onClick={() => openOrder(order)}
                  className="w-full text-left p-3.5 sm:px-4 flex items-start gap-3 hover:bg-gray-50/70 transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-gray-900 truncate">{order.customer_name || t.orders.noName}</p>
                      <span className={`badge shrink-0 ${ORDER_STATUS_COLORS[order.status]}`}>{t.orderStatuses[order.status]}</span>
                    </div>
                    <p className="mt-0.5 text-xs text-gray-500 truncate">
                      {order.items.map((i) => i.title).join(', ')} · {t.orders.itemsCount(itemsCount)}
                    </p>
                    <p className="mt-1 text-xs text-gray-400">
                      {order.phone}
                      {order.customer_telegram && <> · {order.customer_telegram}</>}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold text-gray-900">{formatTotals(order.items)}</p>
                    <p className="mt-0.5 text-[11px] text-gray-400 tabular-nums">{formatDate(order.created_at)}</p>
                  </div>
                </button>
              </li>
            )
          })}
        </ul>
      )}

      <Drawer open={drawerOpen} onClose={closeOrder} side="right" label={t.orders.title} className="w-full sm:w-[440px]">
        {selected && (
          <>
            <div className="flex items-center justify-between gap-3 px-5 h-16 border-b border-gray-100 shrink-0">
              <div className="min-w-0">
                <h2 className="text-base font-semibold text-gray-900">{t.orders.order(selected.id.slice(0, 8))}</h2>
                <p className="text-xs text-gray-400">{new Date(selected.created_at).toLocaleString(dateLocale)}</p>
              </div>
              <button
                onClick={closeOrder}
                aria-label={t.common.close}
                className="w-9 h-9 -mr-2 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto min-h-0 p-5 space-y-5">
              <section>
                <h3 className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">{t.orders.status}</h3>
                <div className="grid grid-cols-2 gap-1.5">
                  {ORDER_STATUS_CODES.map((s) => (
                    <button
                      key={s}
                      onClick={() => updateStatus(selected.id, s)}
                      aria-pressed={selected.status === s}
                      className={`h-10 rounded-full text-sm font-medium transition-colors ${
                        selected.status === s ? 'bg-gray-900 text-white' : `${ORDER_STATUS_COLORS[s]} hover:opacity-80`
                      }`}
                    >
                      {t.orderStatuses[s]}
                    </button>
                  ))}
                </div>
              </section>

              <section className="rounded-2xl border border-gray-100 divide-y divide-gray-100 text-sm">
                {[
                  [t.orders.name, selected.customer_name || '—', null],
                  [t.orders.phone, selected.phone, `tel:${selected.phone}`],
                  ...(selected.customer_telegram
                    ? [['Telegram', selected.customer_telegram, telegramProfileUrl(selected.customer_telegram)] as const]
                    : []),
                ].map(([label, value, href]) => (
                  <div key={label} className="flex items-center justify-between gap-4 px-4 py-3">
                    <span className="text-gray-500">{label}</span>
                    {href ? (
                      <a href={href} target={href.startsWith('tel:') ? undefined : '_blank'} rel="noreferrer" className="font-medium text-accent-700 hover:underline truncate">
                        {value}
                      </a>
                    ) : (
                      <span className="font-medium text-gray-900 truncate">{value}</span>
                    )}
                  </div>
                ))}
              </section>

              <a href={`tel:${selected.phone}`} className="btn-primary w-full h-11">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={PHONE_ICON} />
                </svg>
                {t.orders.call}
              </a>

              <section>
                <h3 className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  {t.orders.items(selected.items.length)}
                </h3>
                <ul className="rounded-2xl border border-gray-100 divide-y divide-gray-100">
                  {selected.items.map((item) => (
                    <li key={item.id} className="flex items-center justify-between gap-3 px-4 py-3">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{item.title}</p>
                        <p className="text-xs text-gray-400 truncate">{item.author}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-semibold text-gray-900">{lineTotal(item)}</p>
                        <p className="text-xs text-gray-400">{item.quantity} × {formatPrice(item.price, item.currency)}</p>
                      </div>
                    </li>
                  ))}
                </ul>
                <div className="flex items-baseline justify-between mt-3 px-1">
                  <span className="text-sm font-medium text-gray-500">{t.orders.total}</span>
                  <span className="text-xl font-bold text-gray-900">{formatTotals(selected.items)}</span>
                </div>
              </section>
            </div>

            <div className="border-t border-gray-100 p-4 shrink-0 pb-[max(1rem,env(safe-area-inset-bottom))]">
              <button
                onClick={() => handleDelete(selected.id)}
                className="w-full h-10 rounded-full text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
              >
                {t.orders.delete}
              </button>
            </div>
          </>
        )}
      </Drawer>
    </AdminShell>
  )
}
