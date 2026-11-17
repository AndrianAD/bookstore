import type { Currency } from './money'

export type BookCondition = 'new' | 'used'

export const CONDITION_BADGES: Record<BookCondition, string> = {
  new:  'bg-emerald-100 text-emerald-700',
  used: 'bg-amber-100 text-amber-700',
}

export const BOOK_CONDITION_CODES = Object.keys(CONDITION_BADGES) as BookCondition[]

export function isBookCondition(value: unknown): value is BookCondition {
  return typeof value === 'string' && value in CONDITION_BADGES
}

/** Rows saved before the condition column existed have no condition. */
export function conditionOf(book: Pick<Book, 'condition'>): BookCondition {
  return isBookCondition(book.condition) ? book.condition : 'new'
}

export interface Book {
  id: string
  title: string
  author: string
  price: number
  currency: Currency
  genre: string
  condition: BookCondition
  description: string
  image_url: string | null
  telegram_message_id?: number | null
  created_at: string
}

export type BookInsert = Omit<Book, 'id' | 'created_at' | 'telegram_message_id'>
export type BookUpdate = Partial<BookInsert>

export const GENRES = [
  'Роман',
  'Детектив',
  'Фантастика',
  'Фэнтези',
  'Биография',
  'История',
  'Наука',
  'Психология',
  'Бизнес',
  'Поэзия',
  'Классика',
  'Приключения',
  'Ужасы',
  'Юмор',
  'Другое',
] as const

export type Genre = (typeof GENRES)[number]

export interface BookFilters {
  search: string
  genre: string
  condition: string
}

export interface CartItem {
  id: string
  title: string
  author: string
  price: number
  currency?: Currency
  image_url: string | null
  quantity: number
}

export type OrderStatus = 'new' | 'called' | 'completed' | 'cancelled'

export interface Order {
  id: string
  phone: string
  customer_name: string | null
  items: CartItem[]
  total: number
  status: OrderStatus
  notes: string | null
  created_at: string
}

export const ORDER_STATUS_COLORS: Record<OrderStatus, string> = {
  new:       'bg-blue-100 text-blue-700',
  called:    'bg-amber-100 text-amber-700',
  completed: 'bg-emerald-100 text-emerald-700',
  cancelled: 'bg-red-100 text-red-700',
}

export const ORDER_STATUS_CODES = Object.keys(ORDER_STATUS_COLORS) as OrderStatus[]
