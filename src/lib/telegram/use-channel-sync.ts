'use client'

import { useCallback, useState } from 'react'
import { useI18n } from '@/lib/i18n/client'
import { ChannelSyncRequest, describeSyncFailure, requestChannelSync } from './channel-sync-api'

const alertUser = (message: string) => window.alert(message)

export function useChannelSync(notify: (message: string) => void = alertUser) {
  const { t } = useI18n()
  const [syncingAll, setSyncingAll] = useState(false)

  const run = useCallback(
    async (request: ChannelSyncRequest) => {
      const response = await requestChannelSync(request)
      if (!response.ok) notify(t.admin.channelNotUpdated(describeSyncFailure(response)))
      return response
    },
    [notify, t],
  )

  const publishBook = useCallback((id: string) => run({ action: 'publish', id }), [run])
  const unpublishBook = useCallback((id: string) => run({ action: 'unpublish', id }), [run])

  const publishAll = useCallback(async () => {
    setSyncingAll(true)
    try {
      const response = await run({ action: 'publish_all' })
      if (response.skipped) notify(t.admin.channelNotConfigured)
      else if (response.ok) notify(t.admin.channelUpdated(response.synced ?? 0))
    } finally {
      setSyncingAll(false)
    }
  }, [run, notify, t])

  return { publishBook, unpublishBook, publishAll, syncingAll }
}
