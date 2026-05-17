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
