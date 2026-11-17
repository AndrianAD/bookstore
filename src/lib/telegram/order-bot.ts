import type { BookRepository } from '@/lib/books/book-repository'
import { Dictionary, genreLabel } from '@/lib/i18n'
import { formatPrice } from '@/lib/money'
import type { OrderNotifier } from '@/lib/orders/order-notifier'
import type { OrderRepository } from '@/lib/orders/order-repository'
import { Book, CartItem, isInStock, stockOf } from '@/lib/types'
import { isStartCommand, parseBookStart } from './bot-link'
import type { BotSessionStore } from './bot-sessions'
import { IncomingMessage, TelegramClient, TelegramUser, escapeHtml } from './client'

const PHONE = /^\+?[\d\s()-]{7,20}$/

interface OrderBotDeps {
  client: TelegramClient
  books: BookRepository
  sessions: BotSessionStore
  orders: OrderRepository
  notifier: OrderNotifier
  t: Dictionary
}

/**
 * Takes orders in a private chat: the channel post opens the bot with a book picked,
 * the bot asks for a phone number, then records the order and alerts the shop.
 */
export class OrderBot {
  constructor(private readonly deps: OrderBotDeps) {}

  async handle(message: IncomingMessage) {
    if (message.chat.type !== 'private') return

    const bookId = parseBookStart(message.text)
    if (bookId) return this.startOrder(message.chat.id, bookId)
    if (isStartCommand(message.text)) return this.reply(message.chat.id, this.deps.t.bot.welcome)

    const phone = message.contact?.phone_number ?? message.text?.trim()
    if (phone && (message.contact || PHONE.test(phone))) {
      return this.completeOrder(message.chat.id, normalizePhone(phone), message.from)
    }
    return this.reply(message.chat.id, this.deps.t.bot.phoneInvalid, this.phoneKeyboard())
  }

  private async startOrder(chatId: number, bookId: string) {
    const { books, sessions, t } = this.deps
    const book = await books.findById(bookId)
    if (!book || !isInStock(book)) return this.reply(chatId, t.bot.bookUnavailable)

    await sessions.remember(chatId, book.id)
    await this.reply(chatId, `${this.describe(book)}\n\n${t.bot.askPhone}`, this.phoneKeyboard())
  }

  private async completeOrder(chatId: number, phone: string, from: TelegramUser | undefined) {
    const { books, sessions, orders, notifier, t } = this.deps
    const bookId = await sessions.take(chatId)
    const book = bookId ? await books.findById(bookId) : null
    if (!book) return this.reply(chatId, t.bot.noPendingBook, removeKeyboard())
    if (!isInStock(book)) return this.reply(chatId, t.bot.bookUnavailable, removeKeyboard())

    const item = toCartItem(book)
    const customerName = [from?.first_name, from?.last_name].filter(Boolean).join(' ') || null
    const customerTelegram = from?.username ? `@${from.username}` : from ? String(from.id) : null

    try {
      await orders.create({ phone, customerName, customerTelegram, items: [item] })
    } catch (error) {
      console.error('Bot order could not be saved:', error)
      return this.reply(chatId, t.bot.orderFailed, removeKeyboard())
    }

    await notifier.notify({ phone, name: customerName, telegram: customerTelegram, items: [item] })
    await this.reply(chatId, t.bot.orderPlaced, removeKeyboard())
  }

  private describe(book: Book) {
    const { t } = this.deps
    return [
      `📚 <b>${escapeHtml(book.title)}</b>`,
      `✍️ ${escapeHtml(book.author)}`,
      `🏷 ${escapeHtml(genreLabel(t, book.genre))}`,
      `💰 <b>${formatPrice(book.price, book.currency)}</b>`,
    ].join('\n')
  }

  private phoneKeyboard() {
    return {
      keyboard: [[{ text: this.deps.t.bot.sharePhone, request_contact: true }]],
      resize_keyboard: true,
      one_time_keyboard: true,
    }
  }

  private reply(chatId: number, text: string, replyMarkup?: object) {
    return this.deps.client.sendMessage(chatId, text, {
      parse_mode: 'HTML',
      ...(replyMarkup ? { reply_markup: replyMarkup } : {}),
    })
  }
}

function removeKeyboard() {
  return { remove_keyboard: true }
}

/** Telegram contacts often come without the leading "+". */
function normalizePhone(phone: string) {
  const digits = phone.replace(/[^\d+]/g, '')
  return digits.startsWith('+') ? digits : `+${digits}`
}

function toCartItem(book: Book): CartItem {
  return {
    id: book.id,
    title: book.title,
    author: book.author,
    price: book.price,
    currency: book.currency,
    image_url: book.image_url,
    quantity: 1,
    stock: stockOf(book),
  }
}
