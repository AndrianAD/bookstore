'use client'

import { useState } from 'react'
import { Book, BookInsert, GENRES } from '@/lib/types'
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
  genre: GENRES[0],
  description: '',
  image_url: '',
}

export default function BookForm({ initial, onSubmit, onCancel }: BookFormProps) {
  const [form, setForm] = useState<BookInsert>(
    initial
      ? {
          title: initial.title,
          author: initial.author,
          price: initial.price,
          genre: initial.genre,
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
    if (!form.title.trim()) e.title = 'Обязательное поле'
    if (!form.author.trim()) e.author = 'Обязательное поле'
    if (!form.price || form.price <= 0) e.price = 'Укажите цену больше 0'
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
              Название <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => set('title', e.target.value)}
              className={`input-field ${errors.title ? 'border-red-400 focus:ring-red-400' : ''}`}
              placeholder="Введите название книги"
            />
            {errors.title && <p className="mt-1 text-xs text-red-500">{errors.title}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Автор <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.author}
              onChange={(e) => set('author', e.target.value)}
              className={`input-field ${errors.author ? 'border-red-400 focus:ring-red-400' : ''}`}
              placeholder="Имя автора"
            />
            {errors.author && <p className="mt-1 text-xs text-red-500">{errors.author}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Цена (€) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min={1}
                step={0.01}
                value={form.price || ''}
                onChange={(e) => set('price', parseFloat(e.target.value) || 0)}
                className={`input-field ${errors.price ? 'border-red-400 focus:ring-red-400' : ''}`}
                placeholder="0.00"
              />
              {errors.price && <p className="mt-1 text-xs text-red-500">{errors.price}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Жанр
              </label>
              <select
                value={form.genre}
                onChange={(e) => set('genre', e.target.value)}
                className="input-field"
              >
                {GENRES.map((g) => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Описание
            </label>
            <textarea
              value={form.description}
              onChange={(e) => set('description', e.target.value)}
              rows={5}
              className="input-field resize-none"
              placeholder="Краткое описание книги..."
            />
          </div>
        </div>

        {/* Right column — image */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Обложка
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
          Отмена
        </button>
        <button type="submit" disabled={submitting} className="btn-primary">
          {submitting ? (
            <span className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Сохранение...
            </span>
          ) : initial ? 'Сохранить изменения' : 'Добавить книгу'}
        </button>
      </div>
    </form>
  )
}
