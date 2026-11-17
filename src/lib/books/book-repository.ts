import type { SupabaseClient } from '@supabase/supabase-js'
import { Book } from '@/lib/types'

export interface BookRepository {
  findById(id: string): Promise<Book | null>
  findAllOldestFirst(): Promise<Book[]>
  saveTelegramMessageId(id: string, messageId: number | null): Promise<void>
}

export class MissingMigrationError extends Error {
  constructor() {
    super('Run supabase/migrations/03_telegram_channel.sql first')
    this.name = 'MissingMigrationError'
  }
}

function assertMigrated(book: Book) {
  if (!('telegram_message_id' in book)) throw new MissingMigrationError()
  return book
}

export class SupabaseBookRepository implements BookRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async findById(id: string) {
    const { data, error } = await this.supabase.from('books').select('*').eq('id', id).maybeSingle<Book>()
    if (error) throw new Error(error.message)
    return data ? assertMigrated(data) : null
  }

  async findAllOldestFirst() {
    const { data, error } = await this.supabase
      .from('books')
      .select('*')
      .order('created_at', { ascending: true })
    if (error) throw new Error(error.message)
    return ((data ?? []) as Book[]).map(assertMigrated)
  }

  async saveTelegramMessageId(id: string, messageId: number | null) {
    const { error } = await this.supabase.from('books').update({ telegram_message_id: messageId }).eq('id', id)
    if (error) throw new Error(error.message)
  }
}
