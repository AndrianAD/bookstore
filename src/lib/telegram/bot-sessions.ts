import type { SupabaseClient } from '@supabase/supabase-js'

/** Remembers which book a Telegram user picked until they send their phone number. */
export interface BotSessionStore {
  remember(chatId: number, bookId: string): Promise<void>
  /** Returns the picked book and forgets it. */
  take(chatId: number): Promise<string | null>
}

export class SupabaseBotSessionStore implements BotSessionStore {
  constructor(private readonly supabase: SupabaseClient) {}

  async remember(chatId: number, bookId: string) {
    const { error } = await this.supabase
      .from('bot_sessions')
      .upsert({ chat_id: chatId, book_id: bookId, created_at: new Date().toISOString() })
    if (error) throw new Error(error.message)
  }

  async take(chatId: number) {
    const { data, error } = await this.supabase
      .from('bot_sessions')
      .delete()
      .eq('chat_id', chatId)
      .select('book_id')
      .maybeSingle()
    if (error) throw new Error(error.message)
    return (data?.book_id as string | undefined) ?? null
  }
}
