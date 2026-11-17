import { InlineKeyboardMarkup, TelegramApiError, TelegramClient, TelegramMessage } from './client'

export interface ChannelPost {
  /** HTML-formatted text; used as the photo caption when there is a photo. */
  text: string
  photoUrl: string | null
  replyMarkup?: InlineKeyboardMarkup
}

export interface PostPublisher {
  /** Creates the post, or updates it in place, and returns the id of the message that shows it. */
  upsert(post: ChannelPost, messageId: number | null): Promise<number>
  remove(messageId: number): Promise<void>
}

const NOT_MODIFIED = /message is not modified/i
const ALREADY_DELETED = /message to delete not found/i

export class TelegramChannelPublisher implements PostPublisher {
  constructor(
    private readonly client: TelegramClient,
    private readonly channelId: string,
  ) {}

  async upsert(post: ChannelPost, messageId: number | null) {
    if (messageId === null) return this.publish(post)

    try {
      await this.edit(post, messageId)
      return messageId
    } catch (error) {
      if (!(error instanceof TelegramApiError)) throw error
      if (error.matches(NOT_MODIFIED)) return messageId
    }

    // Telegram cannot turn a text post into a photo post (or back), and the post may have
    // been removed by hand, so replace it with a fresh one.
    await this.remove(messageId).catch(() => undefined)
    return this.publish(post)
  }

  async remove(messageId: number) {
    try {
      await this.client.call('deleteMessage', { chat_id: this.channelId, message_id: messageId })
    } catch (error) {
      if (!(error instanceof TelegramApiError) || !error.matches(ALREADY_DELETED)) throw error
    }
  }

  private async publish(post: ChannelPost) {
    const common = { chat_id: this.channelId, parse_mode: 'HTML', reply_markup: post.replyMarkup }

    const message = post.photoUrl
      ? await this.client.call<TelegramMessage>('sendPhoto', {
          ...common,
          photo: post.photoUrl,
          caption: post.text,
        })
      : await this.client.call<TelegramMessage>('sendMessage', {
          ...common,
          text: post.text,
          link_preview_options: { is_disabled: true },
        })
    return message.message_id
  }

  private async edit(post: ChannelPost, messageId: number) {
    const target = { chat_id: this.channelId, message_id: messageId, reply_markup: post.replyMarkup }

    if (post.photoUrl) {
      await this.client.call('editMessageMedia', {
        ...target,
        media: { type: 'photo', media: post.photoUrl, caption: post.text, parse_mode: 'HTML' },
      })
    } else {
      await this.client.call('editMessageText', {
        ...target,
        text: post.text,
        parse_mode: 'HTML',
        link_preview_options: { is_disabled: true },
      })
    }
  }
}
