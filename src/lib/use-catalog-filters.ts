'use client'

import { useSearchParams } from 'next/navigation'
import { useCallback } from 'react'
import { updateCatalogUrl } from './catalog-query'

export const FILTER_KEYS = ['condition', 'genre'] as const
export type FilterKey = (typeof FILTER_KEYS)[number]

export function useCatalogFilters() {
  const searchParams = useSearchParams()

  const get = useCallback((key: FilterKey) => searchParams.get(key) ?? '', [searchParams])

  const set = useCallback(
    (key: FilterKey, value: string) => updateCatalogUrl(searchParams, { [key]: value || null }),
    [searchParams],
  )

  /** Clears the filters but keeps the search term and the sort order. */
  const reset = useCallback(
    () => updateCatalogUrl(searchParams, Object.fromEntries(FILTER_KEYS.map((key) => [key, null]))),
    [searchParams],
  )

  const activeCount = FILTER_KEYS.filter((key) => searchParams.get(key)).length

  return { get, set, reset, activeCount }
}

export type CatalogFilters = ReturnType<typeof useCatalogFilters>
