export type BookCondition = 'new' | 'used'

export const BOOK_CONDITIONS: Record<BookCondition, { label: string; badge: string }> = {
  new:  { label: 'Новая', badge: 'bg-emerald-100 text-emerald-700' },
  used: { label: 'Б/у',   badge: 'bg-amber-100 text-amber-700' },
}

export function isBookCondition(value: unknown): value is BookCondition {
  return typeof value === 'string' && value in BOOK_CONDITIONS
}

export function conditionOf(book: Pick<Book, 'condition'>) {
  return BOOK_CONDITIONS[book.condition] ?? BOOK_CONDITIONS.new
}

export interface Book {
  id: string
  title: string
  author: string
  price: number
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
  minPrice: string
  maxPrice: string
  author: string
}

export interface CartItem {
  id: string
  title: string
  author: string
  price: number
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

export const ORDER_STATUSES: Record<OrderStatus, { label: string; color: string }> = {
  new:       { label: 'Новый',     color: 'bg-blue-100 text-blue-700' },
  called:    { label: 'Перезвонили', color: 'bg-amber-100 text-amber-700' },
  completed: { label: 'Завершён',  color: 'bg-emerald-100 text-emerald-700' },
  cancelled: { label: 'Отменён',   color: 'bg-red-100 text-red-700' },
}
