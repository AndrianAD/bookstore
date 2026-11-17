'use client'

import { useState } from 'react'
import { genreLabel } from '@/lib/i18n'
import { useI18n } from '@/lib/i18n/client'
import { CURRENCIES, CURRENCY_CODES, DEFAULT_CURRENCY } from '@/lib/money'
import { BOOK_CONDITION_CODES, Book, BookInsert, GENRES, conditionOf } from '@/lib/types'
import ImageUpload from './ImageUpload'

interface BookFormProps {
  initial?: Book
  onSubmit: (data: BookInsert) => Promise<void>
  onCancel: () => void
}

const EMPTY: BookInsert = {
  title: '',
  author: '',
  price: 0,
  currency: DEFAULT_CURRENCY,
  genre: GENRES[0],
  condition: 'new',
  description: '',
  image_url: '',
}

export default function BookForm({ initial, onSubmit, onCancel }: BookFormProps) {
  const { t } = useI18n()
  const [form, setForm] = useState<BookInsert>(
    initial
      ? {
          title: initial.title,
          author: initial.author,
          price: initial.price,
          currency: initial.currency ?? DEFAULT_CURRENCY,
          genre: initial.genre,
          condition: conditionOf(initial),
          description: initial.description,
          image_url: initial.image_url || '',
        }
      : EMPTY
  )
  const [submitting, setSubmitting] = useState(false)
  const [errors, setErrors] = useState<Partial<Record<keyof BookInsert, string>>>({})

  const set = <K extends keyof BookInsert>(key: K, value: BookInsert[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }))
    setErrors((prev) => ({ ...prev, [key]: undefined }))
  }

  const validate = () => {
    const e: Partial<Record<keyof BookInsert, string>> = {}
    if (!form.title.trim()) e.title = t.bookForm.required
    if (!form.author.trim()) e.author = t.bookForm.required
    if (!form.price || form.price <= 0) e.price = t.bookForm.priceInvalid
    return e
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      return
    }
    setSubmitting(true)
    try {
      await onSubmit(form)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Left column */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              {t.bookForm.title} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => set('title', e.target.value)}
              className={`input-field ${errors.title ? 'border-red-400 focus:ring-red-400' : ''}`}
              placeholder={t.bookForm.titlePlaceholder}
            />
            {errors.title && <p className="mt-1 text-xs text-red-500">{errors.title}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              {t.bookForm.author} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.author}
              onChange={(e) => set('author', e.target.value)}
              className={`input-field ${errors.author ? 'border-red-400 focus:ring-red-400' : ''}`}
              placeholder={t.bookForm.authorPlaceholder}
            />
            {errors.author && <p className="mt-1 text-xs text-red-500">{errors.author}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                {t.bookForm.price} <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  min={1}
                  step={0.01}
                  value={form.price || ''}
                  onChange={(e) => set('price', parseFloat(e.target.value) || 0)}
                  className={`input-field min-w-0 ${errors.price ? 'border-red-400 focus:ring-red-400' : ''}`}
                  placeholder="0.00"
                />
                <div className="flex shrink-0 gap-1 p-1 bg-gray-100 rounded-xl">
                  {CURRENCY_CODES.map((code) => (
                    <button
                      key={code}
                      type="button"
                      onClick={() => set('currency', code)}
                      title={t.currencies[code]}
                      className={`w-9 rounded-lg text-base font-semibold transition-all duration-150 ${
                        form.currency === code ? 'bg-white text-accent-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      {CURRENCIES[code].symbol}
                    </button>
                  ))}
                </div>
              </div>
              {errors.price && <p className="mt-1 text-xs text-red-500">{errors.price}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                {t.bookForm.genre}
              </label>
              <select
                value={form.genre}
                onChange={(e) => set('genre', e.target.value)}
                className="input-field"
              >
                {GENRES.map((g) => (
                  <option key={g} value={g}>{genreLabel(t, g)}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              {t.bookForm.condition}
            </label>
            <div className="grid grid-cols-2 gap-1 p-1 bg-gray-100 rounded-xl">
              {BOOK_CONDITION_CODES.map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => set('condition', value)}
                  className={`py-2 rounded-lg text-sm font-semibold transition-all duration-150 ${
                    form.condition === value ? 'bg-white text-accent-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {t.conditions[value]}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              {t.bookForm.description}
            </label>
            <textarea
              value={form.description}
              onChange={(e) => set('description', e.target.value)}
              rows={5}
              className="input-field resize-none"
              placeholder={t.bookForm.descriptionPlaceholder}
            />
          </div>
        </div>

        {/* Right column — image */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            {t.bookForm.cover}
          </label>
          <ImageUpload
            value={form.image_url || ''}
            onChange={(url) => set('image_url', url)}
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
        <button type="button" onClick={onCancel} className="btn-secondary">
          {t.common.cancel}
        </button>
        <button type="submit" disabled={submitting} className="btn-primary">
          {submitting ? (
            <span className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              {t.bookForm.saving}
            </span>
          ) : initial ? t.bookForm.save : t.bookForm.add}
        </button>
      </div>
    </form>
  )
}
