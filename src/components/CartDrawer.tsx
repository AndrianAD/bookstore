'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { useCart } from '@/lib/cart'
import { useI18n } from '@/lib/i18n/client'
import { lineTotal } from '@/lib/money'
import { createClient } from '@/lib/supabase/client'
import Drawer from './Drawer'

interface CartDrawerProps {
  open: boolean
  onClose: () => void
}

type Step = 'cart' | 'checkout' | 'success'

export default function CartDrawer({ open, onClose }: CartDrawerProps) {
  const { items, remove, setQuantity, clear, total, totalLabel, count } = useCart()
  const { t } = useI18n()
  const [step, setStep] = useState<Step>('cart')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!open) {
      const timer = setTimeout(() => setStep('cart'), 300)
      return () => clearTimeout(timer)
    }
    setError('')
  }, [open])

  const formatPhone = (v: string) => {
    // Keep only "+" (only at start) and digits, up to 15 digits (E.164 max)
    const hasPlus = v.trim().startsWith('+')
    const digits = v.replace(/\D/g, '').slice(0, 15)
    if (!digits) return ''
    return (hasPlus ? '+' : '') + digits
  }

  const isPhoneValid = phone.replace(/\D/g, '').length >= 7

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isPhoneValid || items.length === 0) return
    setSubmitting(true)
    setError('')

    const supabase = createClient()
    const { error } = await supabase.from('orders').insert([{
      phone: phone.trim(),
      customer_name: name.trim() || null,
      items: items,
      total: total,
      status: 'new',
    }])

    setSubmitting(false)
    if (error) {
      console.error('Order insert error:', error)
      setError(t.cart.orderFailed(error.message))
      return
    }

    fetch('/api/notify-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: phone.trim(), name: name.trim() || null, items, total }),
    }).catch(() => {})

    clear()
    setStep('success')
    setName('')
    setPhone('')
  }

  return (
    <Drawer open={open} onClose={onClose} side="right" label={t.cart.title} className="w-full sm:w-[440px]">
        {/* ── HEADER ── */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => step !== 'cart' && step !== 'success' ? setStep('cart') : onClose()}
              className="w-9 h-9 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-all -ml-1.5"
            >
              {step === 'checkout' ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </button>
            <h2 className="text-lg font-bold text-gray-900">
              {step === 'success' ? t.cart.placed : step === 'checkout' ? t.cart.checkout : t.cart.title}
            </h2>
            {step === 'cart' && count > 0 && (
              <span className="badge bg-accent-100 text-accent-700">{count}</span>
            )}
          </div>
        </div>

        {/* ── CART STEP ── */}
        {step === 'cart' && (
          <>
            <div className="flex-1 overflow-y-auto min-h-0">
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center px-8 py-16">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-5">
                    <svg className="w-10 h-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <h3 className="font-bold text-gray-700 mb-1">{t.cart.empty}</h3>
                  <p className="text-sm text-gray-400 max-w-[260px]">{t.cart.emptyHint}</p>
                  <button onClick={onClose} className="btn-primary mt-6">
                    {t.cart.toCatalog}
                  </button>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {items.map((item) => (
                    <div key={item.id} className="flex gap-3 px-5 py-4">
                      {/* Thumbnail */}
                      <div className="relative w-12 h-16 rounded-md overflow-hidden bg-gradient-to-br from-accent-100 to-accent-200 shrink-0">
                        {item.image_url ? (
                          <Image src={item.image_url} alt={item.title} fill className="object-cover" sizes="48px" />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center text-accent-400">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                            </svg>
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0 flex flex-col">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <h3 className="font-semibold text-sm text-gray-900 line-clamp-1">{item.title}</h3>
                            <p className="text-xs text-gray-400">{item.author}</p>
                          </div>
                          <button
                            onClick={() => remove(item.id)}
                            className="text-gray-300 hover:text-red-500 shrink-0 p-1 -mt-1 -mr-1"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>

                        <div className="mt-2 flex items-center justify-between">
                          <div className="flex items-center gap-0.5 bg-gray-100 rounded-lg">
                            <button
                              onClick={() => setQuantity(item.id, item.quantity - 1)}
                              className="w-7 h-7 text-gray-600 hover:bg-gray-200 rounded-l-lg transition-colors flex items-center justify-center font-semibold"
                            >
                              −
                            </button>
                            <span className="w-7 text-center text-sm font-semibold text-gray-900">{item.quantity}</span>
                            <button
                              onClick={() => setQuantity(item.id, item.quantity + 1)}
                              disabled={item.stock !== undefined && item.quantity >= item.stock}
                              className="w-7 h-7 text-gray-600 hover:bg-gray-200 rounded-r-lg transition-colors flex items-center justify-center font-semibold disabled:opacity-30 disabled:hover:bg-transparent"
                            >
                              +
                            </button>
                          </div>
                          <span className="font-bold text-gray-900 text-sm">
                            {lineTotal(item)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="border-t border-gray-100 px-5 py-4 shrink-0 bg-white">
                <div className="flex items-baseline justify-between mb-3">
                  <span className="text-sm font-medium text-gray-500">{t.cart.total}</span>
                  <span className="text-2xl font-extrabold text-gray-900 text-right">
                    {totalLabel}
                  </span>
                </div>
                <button
                  onClick={() => setStep('checkout')}
                  className="btn-primary w-full py-3 text-sm"
                >
                  {t.cart.buyInOneClick}
                </button>
              </div>
            )}
          </>
        )}

        {/* ── CHECKOUT STEP ── */}
        {step === 'checkout' && (
          <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0">
            <div className="flex-1 overflow-y-auto min-h-0 px-5 py-5 space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {t.cart.phone} <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(formatPhone(e.target.value))}
                  placeholder="+33 6 12 34 56 78"
                  className="input-field text-base py-3"
                  autoFocus
                  inputMode="tel"
                />
                <p className="text-xs text-gray-400 mt-2">
                  {t.cart.phoneHint}
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {t.cart.name} <span className="text-gray-400 font-normal">{t.cart.optional}</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t.cart.namePlaceholder}
                  className="input-field text-base py-3"
                />
              </div>

              <div className="bg-gray-50 rounded-2xl p-4">
                <h3 className="font-semibold text-sm text-gray-700 mb-3">{t.cart.yourOrder(count)}</h3>
                <div className="space-y-1.5 mb-3 max-h-40 overflow-y-auto">
                  {items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between text-sm gap-3">
                      <span className="text-gray-600 line-clamp-1 flex-1 min-w-0">
                        {item.title} <span className="text-gray-400">× {item.quantity}</span>
                      </span>
                      <span className="text-gray-900 font-medium shrink-0">
                        {lineTotal(item)}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="flex items-baseline justify-between border-t border-gray-200 pt-3">
                  <span className="text-sm font-semibold text-gray-700">{t.cart.total}</span>
                  <span className="text-xl font-extrabold text-gray-900 text-right">
                    {totalLabel}
                  </span>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
                  {error}
                </div>
              )}
            </div>

            <div className="border-t border-gray-100 px-5 py-4 shrink-0 bg-white">
              <button
                type="submit"
                disabled={!isPhoneValid || submitting}
                className="btn-primary w-full py-3 text-sm"
              >
                {submitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin" />
                    {t.cart.submitting}
                  </span>
                ) : t.cart.confirm}
              </button>
            </div>
          </form>
        )}

        {/* ── SUCCESS STEP ── */}
        {step === 'success' && (
          <div className="flex-1 flex flex-col items-center justify-center text-center px-8">
            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mb-6 animate-fade-in">
              <svg className="w-10 h-10 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-2xl font-extrabold text-gray-900 mb-2">{t.cart.thanks}</h3>
            <p className="text-gray-500 mb-8 max-w-xs">
              {t.cart.thanksHint}
            </p>
            <button onClick={onClose} className="btn-primary px-8">
              {t.cart.continueShopping}
            </button>
          </div>
        )}
    </Drawer>
  )
}
