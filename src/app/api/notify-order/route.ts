import { NextRequest, NextResponse } from 'next/server'
import { getTranslations } from '@/lib/i18n/server'
import { OrderNotifier } from '@/lib/orders/order-notifier'
import { TelegramClient } from '@/lib/telegram/client'
import { readTelegramConfig } from '@/lib/telegram/config'
import { OrderNotification } from '@/lib/telegram/order-message'

export async function POST(req: NextRequest) {
  const { botToken, orderChatIds } = readTelegramConfig()
  if (!botToken || orderChatIds.length === 0) {
    console.error('Telegram order notifications are not configured')
    return NextResponse.json({ ok: false, error: 'Telegram not configured' }, { status: 500 })
  }

  const { t } = await getTranslations()
  const notifier = new OrderNotifier(new TelegramClient(botToken), orderChatIds, t)
  const ok = await notifier.notify((await req.json()) as OrderNotification)
  return NextResponse.json({ ok }, { status: ok ? 200 : 502 })
}
