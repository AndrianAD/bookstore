import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const token = process.env.TELEGRAM_BOT_TOKEN
  const chatIds = (process.env.TELEGRAM_CHAT_ID ?? '').split(',').map((s) => s.trim()).filter(Boolean)

  if (!token || chatIds.length === 0) {
    console.error('Telegram not configured: token=', !!token, 'chatIds=', chatIds)
    return NextResponse.json({ ok: false, error: 'Telegram not configured' }, { status: 500 })
  }

  const { phone, name, items, total } = await req.json()

  const itemLines = items
    .map((i: { title: string; quantity: number; price: number }) =>
      `• ${i.title} x${i.quantity} — ${(i.price * i.quantity).toLocaleString('ru-RU')} €`
    )
    .join('\n')

  const text = [
    '🛒 Новый заказ!',
    '',
    `📞 Телефон: ${phone}`,
    name ? `👤 Имя: ${name}` : null,
    '',
    'Товары:',
    itemLines,
    '',
    `💰 Итого: ${total.toLocaleString('ru-RU')} €`,
  ]
    .filter((l) => l !== null)
    .join('\n')

  const results = await Promise.all(
    chatIds.map(async (chatId) => {
      const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: chatId, text }),
      })
      const json = await res.json()
      console.log(`Telegram [${chatId}]:`, JSON.stringify(json))
      return json
    })
  )

  const allOk = results.every((r) => r.ok)
  return NextResponse.json({ ok: allOk, results })
}
