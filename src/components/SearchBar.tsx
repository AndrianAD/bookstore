'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useCallback, useTransition, useState, useEffect } from 'react'

export default function SearchBar() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()
  const [value, setValue] = useState(searchParams.get('search') || '')

  useEffect(() => {
    setValue(searchParams.get('search') || '')
  }, [searchParams])

  const handleSearch = useCallback(
    (term: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (term) {
        params.set('search', term)
      } else {
        params.delete('search')
      }
      params.delete('page')
      startTransition(() => {
        router.push(`${pathname}?${params.toString()}`)
      })
    },
    [pathname, router, searchParams]
  )

  useEffect(() => {
    const timer = setTimeout(() => handleSearch(value), 400)
    return () => clearTimeout(timer)
  }, [value]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="relative group">
      <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none z-10">
        {isPending ? (
          <div className="w-5 h-5 border-2 border-accent-400 border-t-transparent rounded-full animate-spin" />
        ) : (
          <svg className="w-5 h-5 text-gray-400 group-focus-within:text-accent-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        )}
      </div>
      <input
        type="search"
        placeholder="Поиск по названию, автору..."
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="w-full pl-12 pr-5 py-4 rounded-2xl text-base text-gray-900 placeholder-gray-400 bg-white/95 backdrop-blur-sm border-2 border-transparent focus:border-accent-400 focus:outline-none shadow-lg hover:shadow-xl transition-all duration-200"
      />
      {value && (
        <button
          onClick={() => setValue('')}
          className="absolute inset-y-0 right-4 flex items-center text-gray-400 hover:text-gray-600"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  )
}
