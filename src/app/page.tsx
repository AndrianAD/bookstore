import { Suspense } from 'react'
import CatalogView from '@/components/CatalogView'
import FilterPanel from '@/components/FilterPanel'
import SiteHeader, { SiteFooter } from '@/components/SiteHeader'
import { getTranslations } from '@/lib/i18n/server'
import { createClient } from '@/lib/supabase/server'
import { Book } from '@/lib/types'

/** Loads the whole catalog; search, filters, and sorting run in the browser (see `catalog-query.ts`). */
async function getBooks(): Promise<Book[]> {
  const supabase = await createClient()
  const { data, error } = await supabase.from('books').select('*').order('created_at', { ascending: false })
  if (error) { console.error(error); return [] }
  return data || []
}

export default async function CatalogPage() {
  const [books, { t }] = await Promise.all([getBooks(), getTranslations()])

  return (
    <div className="min-h-screen">
      <SiteHeader t={t} />

      <main className="max-w-[1400px] mx-auto px-4 sm:px-6 pt-3 pb-6 lg:pt-6">
        <div className="flex gap-6">
          <Suspense fallback={<aside className="hidden lg:block w-64 shrink-0" />}>
            <FilterPanel />
          </Suspense>
          <Suspense fallback={<div className="flex-1 min-w-0" />}>
            <CatalogView books={books} />
          </Suspense>
        </div>
      </main>

      <SiteFooter t={t} />
    </div>
  )
}
