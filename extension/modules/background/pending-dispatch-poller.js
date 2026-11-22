import { LOCAL_APP_ORIGIN } from './constants.js'

export function createPendingDispatchPoller(openAndAutoFillPlatform, reportExtensionLog) {
  let isPollingFast = false
  return async function pollPendingDispatchesNow() {
    if (isPollingFast) return
    isPollingFast = true
    try {
      const response = await fetch(`${LOCAL_APP_ORIGIN}/api/social/pending-dispatches`, {
        signal: AbortSignal.timeout(3000)
      })
      if (!response.ok) return
      const item = (await response.json())?.items?.[0]
      if (!item) return
      const pop = await fetch(`${LOCAL_APP_ORIGIN}/api/social/pending-dispatches`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: item.id }),
        signal: AbortSignal.timeout(3000)
      })
      const popped = pop.ok ? (await pop.json())?.item : null
      if (popped) await dispatchOne(item, openAndAutoFillPlatform, reportExtensionLog)
    } catch {
      // Offline polling is intentionally quiet; users can retry from the UI.
    } finally { isPollingFast = false }
  }
}

async function dispatchOne(item, openAndAutoFillPlatform, reportExtensionLog) {
  try {
    await openAndAutoFillPlatform(item)
    await reportExtensionLog({
      platformId: item.platformId, action: 'Browser Dispatch Filled', status: 'success',
      message: `Opened 1 composer tab for ${item.platformId.toUpperCase()}`
    })
  } catch (error) {
    await reportExtensionLog({
      platformId: item.platformId, action: 'Browser Dispatch Error', status: 'error',
      message: `Failed to autofill ${item.platformId}: ${error.message}`
    })
  }
}
