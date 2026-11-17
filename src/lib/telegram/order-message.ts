export interface OrderNotification {
  phone: string
  name: string | null
  items: Array<{ title: string; quantity: number; price: number }>
  total: number
}

const formatEuro = (amount: number) => `${amount.toLocaleString('ru-RU')} €`

export function renderOrderMessage(order: OrderNotification) {
  const itemLines = order.items.map(
    (item) => `• ${item.title} x${item.quantity} — ${formatEuro(item.price * item.quantity)}`,
  )

  return [
    '🛒 Новый заказ!',
    '',
    `📞 Телефон: ${order.phone}`,
    ...(order.name ? [`👤 Имя: ${order.name}`] : []),
    '',
    'Товары:',
    ...itemLines,
    '',
    `💰 Итого: ${formatEuro(order.total)}`,
  ].join('\n')
}
