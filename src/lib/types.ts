export interface Book {
  id: string
  title: string
  author: string
  price: number
  genre: string
  description: string
  image_url: string | null
  created_at: string
}

export type BookInsert = Omit<Book, 'id' | 'created_at'>
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
