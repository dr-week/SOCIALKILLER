export function handlePendingAutopost(message, sendResponse, logError) {
  if (message?.type !== 'FOLLOWDESK_GET_PENDING_AUTOPOST') return undefined
  void getPendingAutopost(message.platformId).then(
    item => sendResponse({ success: Boolean(item), item }),
    error => {
      void logError('get pending autopost', error, message.platformId)
      sendResponse({ success: false, item: null })
    }
  )
  return true
}

async function getPendingAutopost(platformId) {
  const { pendingAutoPosts = {} } = await chrome.storage.local.get('pendingAutoPosts')
  const item = pendingAutoPosts[platformId] || null
  if (!item || Date.now() - item.timestamp >= 5 * 60 * 1000) return null
  delete pendingAutoPosts[platformId]
  await chrome.storage.local.set({ pendingAutoPosts })
  return item
}
