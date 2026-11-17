import { formatPrice } from '@/lib/money'
import { Book, conditionOf } from '@/lib/types'
import { ChannelPost } from './channel-publisher'
import { escapeHtml } from './client'

const CAPTION_LIMIT = 1024
const DESCRIPTION_LIMIT = 600

function truncate(value: string, limit: number) {
  return value.length > limit ? `${value.slice(0, limit - 1).trimEnd()}…` : value
}

export function renderBookPost(book: Book, siteUrl: string): ChannelPost {
  const lines = [
    `<b>${escapeHtml(book.title)}</b>`,
    `✍️ ${escapeHtml(book.author)}`,
    `📚 ${escapeHtml(book.genre)}`,
    `🏷 ${conditionOf(book).label}`,
    `💰 <b>${formatPrice(book.price, book.currency)}</b>`,
  ]
  const description = book.description.trim()
  if (description) lines.push('', escapeHtml(truncate(description, DESCRIPTION_LIMIT)))

  return {
    text: truncate(lines.join('\n'), CAPTION_LIMIT),
    photoUrl: book.image_url || null,
    replyMarkup: {
      inline_keyboard: [[{ text: '🛒 Купить на сайте', url: `${siteUrl}/book/${book.id}` }]],
    },
  }
}
