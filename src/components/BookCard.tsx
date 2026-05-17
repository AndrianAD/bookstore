'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Book } from '@/lib/types'
import { useCart } from '@/lib/cart'

interface BookCardProps {
  book: Book
}

const GENRE_COLORS: Record<string, string> = {
  'Роман': 'from-rose-400 to-pink-600',
  'Детектив': 'from-slate-500 to-gray-700',
  'Фантастика': 'from-blue-400 to-indigo-600',
  'Фэнтези': 'from-violet-400 to-purple-600',
  'Биография': 'from-amber-400 to-orange-500',
  'История': 'from-stone-400 to-stone-600',
  'Наука': 'from-cyan-400 to-teal-600',
  'Психология': 'from-emerald-400 to-green-600',
  'Бизнес': 'from-blue-500 to-cyan-600',
  'Поэзия': 'from-fuchsia-400 to-pink-500',
  'Классика': 'from-amber-500 to-yellow-600',
  'Приключения': 'from-orange-400 to-red-500',
  'Ужасы': 'from-gray-700 to-gray-900',
  'Юмор': 'from-yellow-400 to-orange-400',
  'Другое': 'from-accent-400 to-accent-600',
}

const GENRE_BADGE: Record<string, string> = {
  'Роман': 'bg-rose-100 text-rose-700',
  'Детектив': 'bg-slate-100 text-slate-700',
  'Фантастика': 'bg-blue-100 text-blue-700',
  'Фэнтези': 'bg-violet-100 text-violet-700',
  'Биография': 'bg-amber-100 text-amber-700',
  'История': 'bg-stone-100 text-stone-700',
  'Наука': 'bg-cyan-100 text-cyan-700',
  'Психология': 'bg-emerald-100 text-emerald-700',
  'Бизнес': 'bg-blue-100 text-blue-700',
  'Поэзия': 'bg-fuchsia-100 text-fuchsia-700',
  'Классика': 'bg-amber-100 text-amber-700',
  'Приключения': 'bg-orange-100 text-orange-700',
  'Ужасы': 'bg-gray-100 text-gray-700',
  'Юмор': 'bg-yellow-100 text-yellow-700',
  'Другое': 'bg-accent-100 text-accent-700',
}

export default function BookCard({ book }: BookCardProps) {
  const gradientClass = GENRE_COLORS[book.genre] ?? GENRE_COLORS['Другое']
  const badgeClass = GENRE_BADGE[book.genre] ?? GENRE_BADGE['Другое']
  const { add } = useCart()
  const [added, setAdded] = useState(false)

  const handleAdd = () => {
    add(book)
    setAdded(true)
    setTimeout(() => setAdded(false), 1500)
  }

  return (
    <div className="group flex flex-col bg-white rounded-2xl overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1">
      {/* Cover */}
      <div className="relative aspect-[2/3] overflow-hidden">
        {book.image_url ? (
          <Image
            src={book.image_url}
            alt={book.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
          />
        ) : (
          <div className={`absolute inset-0 bg-gradient-to-br ${gradientClass} flex flex-col items-center justify-center p-4`}>
            {/* Book spine effect */}
            <div className="absolute left-0 top-0 bottom-0 w-3 bg-black/20" />
            <div className="relative z-10 text-center">
              <div className="text-white/30 text-5xl mb-3 font-serif">"</div>
              <p className="text-white font-bold text-xs text-center leading-tight line-clamp-3 drop-shadow">
                {book.title}
              </p>
              <p className="text-white/70 text-xs mt-2 font-medium">{book.author}</p>
            </div>
          </div>
        )}
        {/* Genre badge */}
        <div className="absolute top-2.5 right-2.5 z-10">
          <span className={`badge ${badgeClass} backdrop-blur-sm shadow-sm`}>
            {book.genre}
          </span>
        </div>
      </div>

      {/* Info */}
      <div className="flex flex-col flex-1 p-4">
        <h3 className="font-semibold text-gray-900 text-sm leading-snug line-clamp-2 mb-1 group-hover:text-accent-600 transition-colors">
          {book.title}
        </h3>
        <p className="text-gray-400 text-xs mb-3 font-medium">{book.author}</p>

        <div className="mt-auto flex items-center justify-between pt-3 border-t border-gray-100">
          <div>
            <span className="text-xl font-bold text-gray-900">
              {book.price.toLocaleString('ru-RU')}
            </span>
            <span className="text-sm text-gray-500 ml-1">€</span>
          </div>
          <button
            onClick={handleAdd}
            className={`text-xs py-1.5 px-3 rounded-xl font-semibold transition-all duration-200 active:scale-95 ${
              added
                ? 'bg-emerald-500 text-white'
                : 'bg-gradient-to-r from-accent-600 to-accent-500 hover:from-accent-700 hover:to-accent-600 text-white shadow-sm hover:shadow-glow-sm'
            }`}
          >
            {added ? '✓ Добавлено' : 'В корзину'}
          </button>
        </div>
      </div>
    </div>
  )
}
