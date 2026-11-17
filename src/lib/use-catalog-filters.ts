'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useTransition } from 'react'

export const FILTER_KEYS = ['condition', 'genre'] as const
export type FilterKey = (typeof FILTER_KEYS)[number]

export function useCatalogFilters() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const navigate = useCallback(
    (params: URLSearchParams) => {
      const query = params.toString()
      startTransition(() => router.push(query ? `${pathname}?${query}` : pathname, { scroll: false }))
    },
    [pathname, router],
  )

  const get = useCallback((key: FilterKey) => searchParams.get(key) ?? '', [searchParams])

  const set = useCallback(
    (key: FilterKey, value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value) params.set(key, value)
      else params.delete(key)
      navigate(params)
    },
    [navigate, searchParams],
  )

  /** Clears the filters but keeps the search term and the sort order. */
  const reset = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString())
    FILTER_KEYS.forEach((key) => params.delete(key))
    navigate(params)
  }, [navigate, searchParams])

  const activeCount = FILTER_KEYS.filter((key) => searchParams.get(key)).length

  return { get, set, reset, activeCount, isPending }
}

export type CatalogFilters = ReturnType<typeof useCatalogFilters>
