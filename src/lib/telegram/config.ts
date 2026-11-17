export interface TelegramConfig {
  botToken: string | null
  orderChatIds: string[]
  channelId: string | null
}

export function readTelegramConfig(): TelegramConfig {
  return {
    botToken: process.env.TELEGRAM_BOT_TOKEN || null,
    orderChatIds: (process.env.TELEGRAM_CHAT_ID ?? '')
      .split(',')
      .map((id) => id.trim())
      .filter(Boolean),
    channelId: process.env.TELEGRAM_CHANNEL_ID || null,
  }
}
