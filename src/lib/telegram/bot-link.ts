import { createHash } from 'node:crypto'
import { TelegramClient } from './client'

const BOOK_PAYLOAD_PREFIX = 'book_'
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

/** Deep link that opens the bot and starts an order for the book. */
export function bookOrderLink(botUsername: string, bookId: string) {
  return `https://t.me/${botUsername}?start=${BOOK_PAYLOAD_PREFIX}${bookId}`
}

/** Returns the book id from a `/start book_<id>` message, or null for any other text. */
export function parseBookStart(text: string | undefined) {
  const match = text?.trim().match(/^\/start(?:@\w+)?\s+(\S+)$/)
  const payload = match?.[1]
  if (!payload?.startsWith(BOOK_PAYLOAD_PREFIX)) return null
  const bookId = payload.slice(BOOK_PAYLOAD_PREFIX.length)
  return UUID.test(bookId) ? bookId : null
}

export function isStartCommand(text: string | undefined) {
  return /^\/start(?:@\w+)?(\s|$)/.test(text?.trim() ?? '')
}

/** Derived from the bot token, so the webhook can be verified without another secret to configure. */
export function webhookSecret(botToken: string) {
  return createHash('sha256').update(`webhook:${botToken}`).digest('hex')
}

let cachedUsername: string | null = null

export async function botUsername(client: TelegramClient) {
  if (!cachedUsername) {
    const me = await client.getMe()
    if (!me.username) throw new Error('The bot has no username')
    cachedUsername = me.username
  }
  return cachedUsername
}
