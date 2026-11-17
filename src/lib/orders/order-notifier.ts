import { Dictionary } from '@/lib/i18n'
import { TelegramClient } from '@/lib/telegram/client'
import { OrderNotification, renderOrderMessage } from '@/lib/telegram/order-message'

/** Tells the shop's Telegram chats about a new order. */
export class OrderNotifier {
  constructor(
    private readonly client: TelegramClient,
    private readonly chatIds: string[],
    private readonly t: Dictionary,
  ) {}

  /** Resolves to true only if every chat got the message. */
  async notify(order: OrderNotification) {
    const text = renderOrderMessage(order, this.t)
    const results = await Promise.allSettled(this.chatIds.map((chatId) => this.client.sendMessage(chatId, text)))

    results.forEach((result, i) => {
      if (result.status === 'rejected') {
        console.error(`Telegram order notification to ${this.chatIds[i]} failed:`, result.reason)
      }
    })
    return results.every((result) => result.status === 'fulfilled')
  }
}
