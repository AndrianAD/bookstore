'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Order, OrderStatus, ORDER_STATUSES } from '@/lib/types'
import AdminSidebar from '@/components/AdminSidebar'

export default function OrdersPage() {
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [userEmail, setUserEmail] = useState('')
  const [activeOrder, setActiveOrder] = useState<Order | null>(null)
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

  const updateStatus = async (id: string, status: OrderStatus) => {
    const { error } = await supabase.from('orders').update({ status }).eq('id', id)
    if (error) { alert('Ошибка: ' + error.message); return }
    fetchOrders()
    if (activeOrder?.id === id) setActiveOrder({ ...activeOrder, status })
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Удалить заказ?')) return
    const { error } = await supabase.from('orders').delete().eq('id', id)
    if (error) { alert('Ошибка: ' + error.message); return }
    fetchOrders()
    setActiveOrder(null)
  }

  const filtered = statusFilter === 'all'
    ? orders
    : orders.filter((o) => o.status === statusFilter)

  const counts = {
    all: orders.length,
    new: orders.filter((o) => o.status === 'new').length,
    called: orders.filter((o) => o.status === 'called').length,
    completed: orders.filter((o) => o.status === 'completed').length,
    cancelled: orders.filter((o) => o.status === 'cancelled').length,
  }

  return (
    <div className="min-h-screen bg-[#f8f6ff]">
      <div className="flex">
        <AdminSidebar
          userEmail={userEmail}
          onLogout={handleLogout}
          booksCount={undefined}
          ordersCount={counts.new}
          active="orders"
        />

        <main className="flex-1 lg:ml-64 min-h-screen">
          <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm border-b border-gray-200 px-6 py-4">
            <div>
              <h1 className="text-xl font-bold text-gray-900">Заказы</h1>
              <p className="text-gray-400 text-sm">{loading ? '...' : `${orders.length} заказов всего`}</p>
            </div>
          </header>

          <div className="p-6">
            {/* Status tabs */}
            <div className="flex flex-wrap gap-2 mb-6">
              {([
                ['all', 'Все'],
                ['new', ORDER_STATUSES.new.label],
                ['called', ORDER_STATUSES.called.label],
                ['completed', ORDER_STATUSES.completed.label],
                ['cancelled', ORDER_STATUSES.cancelled.label],
              ] as const).map(([key, label]) => {
                const isActive = statusFilter === key
                const count = counts[key as keyof typeof counts]
                return (
                  <button
                    key={key}
                    onClick={() => setStatusFilter(key as OrderStatus | 'all')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-accent-500 text-white shadow-glow-sm'
                        : 'bg-white text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {label}
                    <span className={`text-xs px-1.5 rounded-full ${isActive ? 'bg-white/30' : 'bg-gray-100'}`}>
                      {count}
                    </span>
                  </button>
                )
              })}
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-32">
                <div className="w-10 h-10 border-3 border-accent-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-card p-20 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-gray-700 mb-1">Заказов нет</h3>
                <p className="text-gray-400 text-sm">Когда поступят заказы, они появятся здесь</p>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-card overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left px-5 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">#</th>
                      <th className="text-left px-5 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Клиент</th>
                      <th className="text-left px-5 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider hidden md:table-cell">Товары</th>
                      <th className="text-right px-5 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Сумма</th>
                      <th className="text-left px-5 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Статус</th>
                      <th className="text-left px-5 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider hidden lg:table-cell">Дата</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {filtered.map((order) => {
                      const itemsCount = order.items.reduce((s, i) => s + i.quantity, 0)
                      const statusInfo = ORDER_STATUSES[order.status]
                      return (
                        <tr
                          key={order.id}
                          onClick={() => setActiveOrder(order)}
                          className="hover:bg-gray-50/60 transition-colors cursor-pointer"
                        >
                          <td className="px-5 py-4">
                            <span className="font-mono text-xs text-gray-400">
                              #{order.id.slice(0, 6)}
                            </span>
                          </td>
                          <td className="px-5 py-4">
                            <div>
                              <p className="font-semibold text-gray-900">
                                {order.customer_name || 'Без имени'}
                              </p>
                              <a
                                href={`tel:${order.phone}`}
                                onClick={(e) => e.stopPropagation()}
                                className="text-xs text-accent-600 hover:underline"
                              >
                                {order.phone}
                              </a>
                            </div>
                          </td>
                          <td className="px-5 py-4 hidden md:table-cell">
                            <p className="text-gray-600 line-clamp-1 max-w-xs">
                              {order.items.map((i) => i.title).join(', ')}
                            </p>
                            <p className="text-xs text-gray-400 mt-0.5">
                              {itemsCount} {itemsCount === 1 ? 'товар' : 'товаров'}
                            </p>
                          </td>
                          <td className="px-5 py-4 text-right">
                            <span className="font-bold text-gray-900">
                              {order.total.toLocaleString('ru-RU')} €
                            </span>
                          </td>
                          <td className="px-5 py-4">
                            <span className={`badge ${statusInfo.color}`}>
                              {statusInfo.label}
                            </span>
                          </td>
                          <td className="px-5 py-4 hidden lg:table-cell text-gray-500 text-xs">
                            {new Date(order.created_at).toLocaleString('ru-RU', {
                              day: '2-digit', month: '2-digit', year: '2-digit',
                              hour: '2-digit', minute: '2-digit',
                            })}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Detail drawer */}
      {activeOrder && (
        <>
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={() => setActiveOrder(null)}
          />
          <div className="fixed top-0 right-0 bottom-0 w-full sm:w-[480px] bg-white z-50 shadow-2xl flex flex-col animate-slide-up">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <div>
                <h2 className="font-bold text-gray-900">Заказ #{activeOrder.id.slice(0, 8)}</h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  {new Date(activeOrder.created_at).toLocaleString('ru-RU')}
                </p>
              </div>
              <button
                onClick={() => setActiveOrder(null)}
                className="w-9 h-9 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-all"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-5">
              {/* Customer */}
              <div className="bg-gray-50 rounded-2xl p-4">
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Клиент</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Имя</span>
                    <span className="text-sm font-semibold text-gray-900">
                      {activeOrder.customer_name || '—'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Телефон</span>
                    <a href={`tel:${activeOrder.phone}`} className="text-sm font-bold text-accent-600 hover:underline">
                      {activeOrder.phone}
                    </a>
                  </div>
                </div>
                <a
                  href={`tel:${activeOrder.phone}`}
                  className="btn-primary w-full mt-3 flex items-center justify-center gap-2 py-2.5"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  Позвонить
                </a>
              </div>

              {/* Items */}
              <div>
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                  Товары ({activeOrder.items.length})
                </h3>
                <div className="space-y-2">
                  {activeOrder.items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-3 rounded-xl border border-gray-100">
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-sm text-gray-900 line-clamp-1">{item.title}</p>
                        <p className="text-xs text-gray-400">{item.author}</p>
                      </div>
                      <div className="text-right shrink-0 ml-3">
                        <p className="font-bold text-sm text-gray-900">
                          {(item.price * item.quantity).toLocaleString('ru-RU')} €
                        </p>
                        <p className="text-xs text-gray-400">
                          {item.quantity} × {item.price.toLocaleString('ru-RU')} €
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex items-baseline justify-between mt-4 pt-4 border-t border-gray-100">
                  <span className="text-sm font-semibold text-gray-700">Итого</span>
                  <span className="text-2xl font-extrabold text-gray-900">
                    {activeOrder.total.toLocaleString('ru-RU')} €
                  </span>
                </div>
              </div>

              {/* Status */}
              <div>
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Статус</h3>
                <div className="grid grid-cols-2 gap-2">
                  {(Object.keys(ORDER_STATUSES) as OrderStatus[]).map((s) => {
                    const info = ORDER_STATUSES[s]
                    const active = activeOrder.status === s
                    return (
                      <button
                        key={s}
                        onClick={() => updateStatus(activeOrder.id, s)}
                        className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                          active
                            ? 'bg-accent-500 text-white shadow-glow-sm'
                            : `${info.color} hover:opacity-80`
                        }`}
                      >
                        {info.label}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>

            <div className="border-t border-gray-100 p-5">
              <button
                onClick={() => handleDelete(activeOrder.id)}
                className="w-full text-sm text-red-600 hover:bg-red-50 py-2.5 rounded-xl transition-colors"
              >
                Удалить заказ
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
