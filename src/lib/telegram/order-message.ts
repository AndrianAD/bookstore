import { PricedLine, formatTotals, lineTotal } from '@/lib/money'

export interface OrderNotification {
  phone: string
  name: string | null
  items: Array<PricedLine & { title: string }>
}

export function renderOrderMessage(order: OrderNotification) {
  const itemLines = order.items.map((item) => `• ${item.title} x${item.quantity} — ${lineTotal(item)}`)

  return [
    '🛒 Новый заказ!',
    '',
    `📞 Телефон: ${order.phone}`,
    ...(order.name ? [`👤 Имя: ${order.name}`] : []),
    '',
    'Товары:',
    ...itemLines,
    '',
    `💰 Итого: ${formatTotals(order.items)}`,
  ].join('\n')
}
