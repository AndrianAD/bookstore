import type { Metadata } from 'next'
import { I18nProvider } from '@/lib/i18n/client'
import { getTranslations } from '@/lib/i18n/server'
import './globals.css'

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getTranslations()
  return { title: t.meta.title, description: t.meta.description }
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { locale } = await getTranslations()
  return (
    <html lang={locale}>
      <body>
        <I18nProvider locale={locale}>{children}</I18nProvider>
      </body>
    </html>
  )
}
