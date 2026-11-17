'use client'

import { useCallback, useState } from 'react'
import { ChannelSyncRequest, describeSyncFailure, requestChannelSync } from './channel-sync-api'

const alertUser = (message: string) => window.alert(message)

export function useChannelSync(notify: (message: string) => void = alertUser) {
  const [syncingAll, setSyncingAll] = useState(false)

  const run = useCallback(
    async (request: ChannelSyncRequest) => {
      const response = await requestChannelSync(request)
      if (!response.ok) notify('Telegram-канал не обновлён:\n' + describeSyncFailure(response))
      return response
    },
    [notify],
  )

  const publishBook = useCallback((id: string) => run({ action: 'publish', id }), [run])
  const unpublishBook = useCallback((id: string) => run({ action: 'unpublish', id }), [run])

  const publishAll = useCallback(async () => {
    setSyncingAll(true)
    try {
      const response = await run({ action: 'publish_all' })
      if (response.skipped) notify('Telegram-канал не настроен: добавьте TELEGRAM_CHANNEL_ID')
      else if (response.ok) notify(`Telegram-канал обновлён: ${response.synced} книг`)
    } finally {
      setSyncingAll(false)
    }
  }, [run, notify])

  return { publishBook, unpublishBook, publishAll, syncingAll }
}
