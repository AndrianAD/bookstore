'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { genreGradient } from '@/lib/genre-style'
import { genreLabel } from '@/lib/i18n'
import { useI18n } from '@/lib/i18n/client'
import { formatPrice } from '@/lib/money'
import { createClient } from '@/lib/supabase/client'
import { useChannelSync } from '@/lib/telegram/use-channel-sync'
import { Book, BookInsert, isInStock, stockOf } from '@/lib/types'
import AdminShell from '@/components/AdminShell'
import BookForm from '@/components/BookForm'
import Dialog from '@/components/Dialog'

type Modal = { mode: 'add' } | { mode: 'edit'; book: Book } | null

const ICONS = {
  plus: 'M12 4v16m8-8H4',
  telegram: 'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15',
  edit: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z',
  trash: 'M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16',
  search: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z',
}

function Icon({ d, className = 'w-4 h-4' }: { d: string; className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={d} />
    </svg>
  )
}

export default function AdminPage() {
  const router = useRouter()
  const [books, setBooks] = useState<Book[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState<Modal>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [userEmail, setUserEmail] = useState('')
  const [search, setSearch] = useState('')
  const [newOrdersCount, setNewOrdersCount] = useState(0)
  const channel = useChannelSync()
  const { t } = useI18n()

  const supabase = createClient()

  const fetchBooks = useCallback(async () => {
    const { data } = await supabase
      .from('books')
      .select('*')
      .order('created_at', { ascending: false })
    setBooks(data || [])
    setLoading(false)
  }, [supabase])

  const fetchOrdersCount = useCallback(async () => {
    const { count } = await supabase
      .from('orders')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'new')
    setNewOrdersCount(count || 0)
  }, [supabase])

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { router.push('/admin/login'); return }
      setUserEmail(user.email || '')
    })
    fetchBooks()
    fetchOrdersCount()
  }, [fetchBooks, fetchOrdersCount, router, supabase.auth])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/admin/login')
  }

  const handleAdd = async (data: BookInsert) => {
    const { data: created, error } = await supabase.from('books').insert([data]).select('id').single()
    if (error) { alert(t.common.error(error.message)); return }
    setModal(null)
    fetchBooks()
    await channel.publishBook(created.id)
  }

  const handleEdit = async (data: BookInsert) => {
    if (modal?.mode !== 'edit') return
    const id = modal.book.id
    const { error } = await supabase.from('books').update(data).eq('id', id)
    if (error) { alert(t.common.error(error.message)); return }
    setModal(null)
    fetchBooks()
    await channel.publishBook(id)
  }

  const handleDelete = async (id: string) => {
    await channel.unpublishBook(id)
    const { error } = await supabase.from('books').delete().eq('id', id)
    if (error) { alert(t.common.error(error.message)); return }
    setDeleteId(null)
    fetchBooks()
  }

  const query = search.trim().toLowerCase()
  const filtered = books.filter(
    (b) => b.title.toLowerCase().includes(query) || b.author.toLowerCase().includes(query)
  )

  const actions = (
    <>
      <button
        onClick={channel.publishAll}
        disabled={channel.syncingAll}
        className="btn-secondary px-3 sm:px-4"
        title={t.admin.syncChannelHint}
        aria-label={t.admin.syncChannel}
      >
        <Icon d={ICONS.telegram} className={`w-4 h-4 ${channel.syncingAll ? 'animate-spin' : ''}`} />
        <span className="hidden sm:inline">{channel.syncingAll ? t.admin.syncingChannel : t.admin.syncChannel}</span>
      </button>
      <button onClick={() => setModal({ mode: 'add' })} className="btn-primary px-4">
        <Icon d={ICONS.plus} />
        {t.admin.add}
      </button>
    </>
  )

  return (
    <AdminShell
      active="books"
      userEmail={userEmail}
      onLogout={handleLogout}
      booksCount={books.length}
      newOrdersCount={newOrdersCount}
      title={t.admin.books}
      subtitle={loading ? undefined : t.admin.booksCount(books.length)}
      actions={actions}
    >
      <div className="relative mb-3 max-w-md">
        <Icon d={ICONS.search} className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="search"
          placeholder={t.admin.searchPlaceholder}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-field pl-10 rounded-full"
        />
      </div>

      {loading ? (
        <div className="bg-white rounded-2xl border border-gray-100 divide-y divide-gray-100">
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i} className="flex items-center gap-3 p-3">
              <div className="w-11 h-14 rounded-lg bg-gray-100 animate-pulse" />
              <div className="flex-1 space-y-2">
                <div className="h-3.5 w-2/3 rounded bg-gray-100 animate-pulse" />
                <div className="h-3 w-1/3 rounded bg-gray-100 animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 px-6 py-14 text-center">
          <h3 className="text-base font-semibold text-gray-800 mb-1">{t.admin.noBooks}</h3>
          <p className="text-gray-400 text-sm mb-5">{t.admin.noBooksHint}</p>
          <button onClick={() => setModal({ mode: 'add' })} className="btn-primary">
            <Icon d={ICONS.plus} />
            {t.admin.addBook}
          </button>
        </div>
      ) : (
        <ul className="bg-white rounded-2xl border border-gray-100 divide-y divide-gray-100 overflow-hidden">
          {filtered.map((book) => {
            const inStock = isInStock(book)
            return (
              <li key={book.id} className="flex items-center gap-3 p-3 sm:px-4 hover:bg-gray-50/70 transition-colors">
                <button
                  onClick={() => setModal({ mode: 'edit', book })}
                  className="flex items-center gap-3 flex-1 min-w-0 text-left"
                >
                  <div className={`relative w-11 h-14 rounded-lg overflow-hidden shrink-0 bg-gradient-to-br ${genreGradient(book.genre)} ${inStock ? '' : 'grayscale opacity-60'}`}>
                    {book.image_url && (
                      <Image src={book.image_url} alt="" fill className="object-cover" sizes="44px" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-gray-900 truncate">{book.title}</p>
                    <p className="text-xs text-gray-500 truncate">
                      {book.author}
                      <span className="hidden sm:inline"> · {genreLabel(t, book.genre)}</span>
                    </p>
                    <p className="mt-1 text-xs flex items-center gap-2">
                      <span className="font-semibold text-gray-900">{formatPrice(book.price, book.currency)}</span>
                      <span className={inStock ? 'text-gray-400' : 'text-red-600 font-medium'}>
                        {inStock ? t.admin.inStockCount(stockOf(book)) : t.book.sold}
                      </span>
                    </p>
                  </div>
                </button>
                <div className="flex items-center shrink-0">
                  <button
                    onClick={() => setModal({ mode: 'edit', book })}
                    className="hidden sm:flex w-9 h-9 rounded-full items-center justify-center text-gray-400 hover:text-accent-600 hover:bg-accent-50 transition-colors"
                    title={t.common.edit}
                    aria-label={t.common.edit}
                  >
                    <Icon d={ICONS.edit} />
                  </button>
                  <button
                    onClick={() => setDeleteId(book.id)}
                    className="w-9 h-9 rounded-full flex items-center justify-center text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                    title={t.common.delete}
                    aria-label={t.common.delete}
                  >
                    <Icon d={ICONS.trash} />
                  </button>
                </div>
              </li>
            )
          })}
        </ul>
      )}

      {modal && (
        <Dialog title={modal.mode === 'add' ? t.admin.addTitle : t.admin.editTitle} onClose={() => setModal(null)}>
          <div className="p-5">
            <BookForm
              initial={modal.mode === 'edit' ? modal.book : undefined}
              onSubmit={modal.mode === 'add' ? handleAdd : handleEdit}
              onCancel={() => setModal(null)}
            />
          </div>
        </Dialog>
      )}

      {deleteId && (
        <Dialog size="sm" onClose={() => setDeleteId(null)}>
          <div className="p-6 text-center">
            <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4 text-red-500">
              <Icon d={ICONS.trash} className="w-6 h-6" />
            </div>
            <h3 className="text-base font-semibold text-gray-900 mb-1">{t.admin.deleteTitle}</h3>
            <p className="text-gray-500 text-sm mb-6">{t.admin.deleteHint}</p>
            <div className="flex gap-2">
              <button onClick={() => setDeleteId(null)} className="btn-secondary flex-1">{t.common.cancel}</button>
              <button onClick={() => handleDelete(deleteId)} className="btn-danger flex-1">{t.common.delete}</button>
            </div>
          </div>
        </Dialog>
      )}
    </AdminShell>
  )
}
