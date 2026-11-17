import { Dictionary } from '@/lib/i18n'
import { renderBookPost } from '@/lib/telegram/book-post'
import { PostPublisher } from '@/lib/telegram/channel-publisher'
import { Book, isInStock } from '@/lib/types'
import { BookRepository } from './book-repository'

export class BookNotFoundError extends Error {
  constructor(id: string) {
    super(`Book ${id} not found`)
    this.name = 'BookNotFoundError'
  }
}

export interface SyncAllResult {
  synced: number
  failed: string[]
}

/** Builds the link behind the post's order button for a given book. */
export type OrderLink = (bookId: string) => string

export class BookChannelSync {
  constructor(
    private readonly books: BookRepository,
    private readonly publisher: PostPublisher,
    private readonly orderLink: OrderLink,
    private readonly t: Dictionary,
  ) {}

  async publishBook(id: string) {
    await this.sync(await this.getBook(id))
  }

  /** Must run before the book row is deleted: the post is located through the row. */
  async unpublishBook(id: string) {
    const book = await this.getBook(id)
    if (book.telegram_message_id) await this.publisher.remove(book.telegram_message_id)
  }

  async publishAll(): Promise<SyncAllResult> {
    const books = await this.books.findAllOldestFirst()
    const failed: string[] = []

    for (const book of books) {
      try {
        await this.sync(book)
      } catch (error) {
        failed.push(`${book.title}: ${(error as Error).message}`)
      }
    }
    return { synced: books.length - failed.length, failed }
  }

  private async getBook(id: string) {
    const book = await this.books.findById(id)
    if (!book) throw new BookNotFoundError(id)
    return book
  }

  /** Books in stock have a post in the channel; sold-out books have none. */
  private async sync(book: Book) {
    const currentId = book.telegram_message_id ?? null

    if (!isInStock(book)) {
      if (currentId === null) return
      await this.publisher.remove(currentId)
      await this.books.saveTelegramMessageId(book.id, null)
      return
    }

    const post = renderBookPost(book, this.orderLink(book.id), this.t)
    const messageId = await this.publisher.upsert(post, currentId)
    if (messageId !== currentId) await this.books.saveTelegramMessageId(book.id, messageId)
  }
}
