import { Book, BookCondition, conditionOf, isBookCondition } from './types'

export const SORT_KEYS = ['newest', 'price_asc', 'price_desc', 'title_asc'] as const
export type SortKey = (typeof SORT_KEYS)[number]

export interface CatalogQuery {
  search: string
  genre: string
  condition: BookCondition | null
  sort: SortKey
}

function isSortKey(value: unknown): value is SortKey {
  return SORT_KEYS.includes(value as SortKey)
}

export function readCatalogQuery(params: URLSearchParams): CatalogQuery {
  const condition = params.get('condition')
  const sort = params.get('sort')
  return {
    search: params.get('search')?.trim() ?? '',
    genre: params.get('genre') ?? '',
    condition: isBookCondition(condition) ? condition : null,
    sort: isSortKey(sort) ? sort : 'newest',
  }
}

const COMPARATORS: Record<SortKey, (a: Book, b: Book) => number> = {
  newest: (a, b) => b.created_at.localeCompare(a.created_at),
  price_asc: (a, b) => a.price - b.price,
  price_desc: (a, b) => b.price - a.price,
  title_asc: (a, b) => a.title.localeCompare(b.title),
}

/** Filters and sorts in the browser: the whole catalog is loaded once, so filters respond instantly. */
export function applyCatalogQuery(books: Book[], query: CatalogQuery) {
  const term = query.search.toLowerCase()
  return books
    .filter((book) =>
      (!term || book.title.toLowerCase().includes(term) || book.author.toLowerCase().includes(term)) &&
      (!query.genre || book.genre === query.genre) &&
      (!query.condition || conditionOf(book) === query.condition),
    )
    .sort(COMPARATORS[query.sort])
}

/**
 * Changes the catalog query string without a server round trip.
 * Next.js keeps `useSearchParams` in sync with the native History API.
 */
export function updateCatalogUrl(
  current: URLSearchParams,
  changes: Record<string, string | null>,
  mode: 'push' | 'replace' = 'push',
) {
  const params = new URLSearchParams(current.toString())
  for (const [key, value] of Object.entries(changes)) {
    if (value) params.set(key, value)
    else params.delete(key)
  }
  const query = params.toString()
  const url = query ? `${window.location.pathname}?${query}` : window.location.pathname
  if (mode === 'push') window.history.pushState(null, '', url)
  else window.history.replaceState(null, '', url)
}
