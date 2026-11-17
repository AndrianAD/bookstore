export type ChannelSyncRequest =
  | { action: 'publish'; id: string }
  | { action: 'unpublish'; id: string }
  | { action: 'publish_all' }

export interface ChannelSyncResponse {
  ok: boolean
  skipped?: boolean
  synced?: number
  failed?: string[]
  error?: string
}

export async function requestChannelSync(request: ChannelSyncRequest): Promise<ChannelSyncResponse> {
  try {
    const res = await fetch('/api/telegram-channel', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    })
    return (await res.json()) as ChannelSyncResponse
  } catch (error) {
    return { ok: false, error: (error as Error).message }
  }
}

export function describeSyncFailure(response: ChannelSyncResponse) {
  return response.failed?.length ? response.failed.join('\n') : response.error ?? 'Unknown error'
}
