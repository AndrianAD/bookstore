import { NextRequest, NextResponse } from 'next/server'
import { BookChannelSync, BookNotFoundError } from '@/lib/books/book-channel-sync'
import { MissingMigrationError, SupabaseBookRepository } from '@/lib/books/book-repository'
import { createClient } from '@/lib/supabase/server'
import { TelegramChannelPublisher } from '@/lib/telegram/channel-publisher'
import { TelegramClient } from '@/lib/telegram/client'
import { readTelegramConfig } from '@/lib/telegram/config'
import type { ChannelSyncRequest, ChannelSyncResponse } from '@/lib/telegram/channel-sync-api'

export const maxDuration = 60

function respond(body: ChannelSyncResponse, status = 200) {
  return NextResponse.json(body, { status })
}

function statusFor(error: unknown) {
  if (error instanceof BookNotFoundError) return 404
  if (error instanceof MissingMigrationError) return 500
  return 502
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return respond({ ok: false, error: 'Unauthorized' }, 401)

  const { botToken, channelId } = readTelegramConfig()
  if (!botToken || !channelId) return respond({ ok: true, skipped: true })

  const sync = new BookChannelSync(
    new SupabaseBookRepository(supabase),
    new TelegramChannelPublisher(new TelegramClient(botToken), channelId),
    req.nextUrl.origin,
  )
  const request = (await req.json()) as ChannelSyncRequest

  try {
    switch (request.action) {
      case 'publish':
        await sync.publishBook(request.id)
        return respond({ ok: true })
      case 'unpublish':
        await sync.unpublishBook(request.id)
        return respond({ ok: true })
      case 'publish_all': {
        const { synced, failed } = await sync.publishAll()
        return respond({ ok: failed.length === 0, synced, failed })
      }
      default:
        return respond({ ok: false, error: 'Unknown action' }, 400)
    }
  } catch (error) {
    console.error('Telegram channel sync failed:', error)
    return respond({ ok: false, error: (error as Error).message }, statusFor(error))
  }
}
