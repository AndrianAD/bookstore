import { Dictionary } from '@/lib/i18n'
import { PricedLine, formatTotals, lineTotal } from '@/lib/money'

export interface OrderNotification {
  phone: string
  name: string | null
  items: Array<PricedLine & { title: string }>
}

export function renderOrderMessage(order: OrderNotification, t: Dictionary) {
  const itemLines = order.items.map((item) => `• ${item.title} x${item.quantity} — ${lineTotal(item)}`)

  return [
    t.telegram.newOrder,
    '',
    `${t.telegram.phone}: ${order.phone}`,
    ...(order.name ? [`${t.telegram.name}: ${order.name}`] : []),
    '',
    t.telegram.items,
    ...itemLines,
    '',
    `${t.telegram.total}: ${formatTotals(order.items)}`,
  ].join('\n')
}
