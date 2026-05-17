import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Книжный магазин',
  description: 'Большой выбор книг по лучшим ценам',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  )
}
