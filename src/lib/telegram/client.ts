const API_URL = 'https://api.telegram.org'
const MAX_RATE_LIMIT_RETRIES = 2

interface TelegramResponse<T> {
  ok: boolean
  result?: T
  description?: string
  parameters?: { retry_after?: number }
}

export interface TelegramMessage {
  message_id: number
}

export interface InlineKeyboardMarkup {
  inline_keyboard: Array<Array<{ text: string; url: string }>>
}

export interface TelegramUser {
  id: number
  username?: string
  first_name?: string
  last_name?: string
}

export interface IncomingMessage {
  message_id: number
  chat: { id: number; type: 'private' | 'group' | 'supergroup' | 'channel' }
  from?: TelegramUser
  text?: string
  contact?: { phone_number: string; user_id?: number }
}

export interface TelegramUpdate {
  update_id: number
  message?: IncomingMessage
}

export class TelegramApiError extends Error {
  constructor(
    readonly method: string,
    readonly description: string,
  ) {
    super(`${method}: ${description}`)
    this.name = 'TelegramApiError'
  }

  matches(pattern: RegExp) {
    return pattern.test(this.description)
  }
}

export class TelegramClient {
  constructor(private readonly token: string) {}

  async call<T = true>(method: string, params: Record<string, unknown>): Promise<T> {
    for (let attempt = 0; ; attempt++) {
      const res = await fetch(`${API_URL}/bot${this.token}/${method}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      })
      const json = (await res.json()) as TelegramResponse<T>
      if (json.ok) return json.result as T

      const retryAfter = json.parameters?.retry_after
      if (!retryAfter || attempt >= MAX_RATE_LIMIT_RETRIES) {
        throw new TelegramApiError(method, json.description ?? 'Unknown error')
      }
      await new Promise((resolve) => setTimeout(resolve, retryAfter * 1000))
    }
  }

  sendMessage(chatId: string | number, text: string, extra: Record<string, unknown> = {}) {
    return this.call<TelegramMessage>('sendMessage', { chat_id: chatId, text, ...extra })
  }

  getMe() {
    return this.call<TelegramUser>('getMe', {})
  }

  setWebhook(url: string, secretToken: string, allowedUpdates: string[]) {
    return this.call('setWebhook', { url, secret_token: secretToken, allowed_updates: allowedUpdates })
  }
}

export function escapeHtml(value: string) {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}
