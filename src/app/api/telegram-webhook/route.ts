import { NextRequest, NextResponse } from 'next/server'
import { SupabaseBookRepository } from '@/lib/books/book-repository'
import { getDictionary } from '@/lib/i18n'
import { OrderNotifier } from '@/lib/orders/order-notifier'
import { SupabaseOrderRepository } from '@/lib/orders/order-repository'
import { readSiteLocale } from '@/lib/settings/site-settings'
import { createAdminClient } from '@/lib/supabase/admin'
import { webhookSecret } from '@/lib/telegram/bot-link'
import { SupabaseBotSessionStore } from '@/lib/telegram/bot-sessions'
import { TelegramClient, TelegramUpdate } from '@/lib/telegram/client'
import { readTelegramConfig } from '@/lib/telegram/config'
import { OrderBot } from '@/lib/telegram/order-bot'

export async function POST(req: NextRequest) {
  const { botToken, orderChatIds } = readTelegramConfig()
  if (!botToken) return NextResponse.json({ ok: false }, { status: 503 })

  if (req.headers.get('x-telegram-bot-api-secret-token') !== webhookSecret(botToken)) {
    return NextResponse.json({ ok: false }, { status: 401 })
  }

  const update = (await req.json()) as TelegramUpdate
  if (!update.message) return NextResponse.json({ ok: true })

  // Telegram retries any update that does not get a 200, so failures are logged, not returned.
  try {
    const supabase = createAdminClient()
    const client = new TelegramClient(botToken)
    const t = getDictionary(await readSiteLocale(supabase))

    const bot = new OrderBot({
      client,
      books: new SupabaseBookRepository(supabase),
      sessions: new SupabaseBotSessionStore(supabase),
      orders: new SupabaseOrderRepository(supabase),
      notifier: new OrderNotifier(client, orderChatIds, t),
      t,
    })
    await bot.handle(update.message)
  } catch (error) {
    console.error('Telegram webhook failed:', error)
  }
  return NextResponse.json({ ok: true })
}
