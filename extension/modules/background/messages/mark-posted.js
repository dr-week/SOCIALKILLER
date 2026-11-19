import { LOCAL_APP_ORIGIN } from '../constants.js'

export function handleMarkPosted(message, sendResponse, logError) {
  if (message?.type !== 'FOLLOWDESK_MARK_POSTED') return undefined
  void (async () => {
    try {
      const response = await fetch(`${LOCAL_APP_ORIGIN}/api/social/mark-published`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId: message.postId, platformId: message.platformId, externalUrl: message.externalUrl || null })
      })
      sendResponse({ success: response.ok })
    } catch (error) {
      await logError('mark posted', error, message.platformId)
      sendResponse({ success: false })
    }
  })()
  return true
}
