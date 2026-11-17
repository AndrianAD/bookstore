import { NextRequest, NextResponse } from 'next/server'
import { getTranslations } from '@/lib/i18n/server'
import { TelegramClient } from '@/lib/telegram/client'
import { readTelegramConfig } from '@/lib/telegram/config'
import { OrderNotification, renderOrderMessage } from '@/lib/telegram/order-message'

export async function POST(req: NextRequest) {
  const { botToken, orderChatIds } = readTelegramConfig()
  if (!botToken || orderChatIds.length === 0) {
    console.error('Telegram order notifications are not configured')
    return NextResponse.json({ ok: false, error: 'Telegram not configured' }, { status: 500 })
  }

  const { t } = await getTranslations()
  const text = renderOrderMessage((await req.json()) as OrderNotification, t)
  const client = new TelegramClient(botToken)

  const results = await Promise.allSettled(orderChatIds.map((chatId) => client.sendMessage(chatId, text)))
  results.forEach((result, i) => {
    if (result.status === 'rejected') {
      console.error(`Telegram order notification to ${orderChatIds[i]} failed:`, result.reason)
    }
  })

  const ok = results.every((result) => result.status === 'fulfilled')
  return NextResponse.json({ ok }, { status: ok ? 200 : 502 })
}
