import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import { I18nProvider } from '@/lib/i18n/client'
import { getTranslations } from '@/lib/i18n/server'
import './globals.css'

const inter = Inter({ subsets: ['latin', 'cyrillic'], display: 'swap', variable: '--font-inter' })

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getTranslations()
  return { title: t.meta.title, description: t.meta.description }
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#ffffff',
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { locale } = await getTranslations()
  return (
    <html lang={locale} className={inter.variable}>
      <body className="font-sans">
        <I18nProvider locale={locale}>{children}</I18nProvider>
      </body>
    </html>
  )
}
