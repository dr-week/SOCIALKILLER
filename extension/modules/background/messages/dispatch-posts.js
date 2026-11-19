export function handleDispatchPosts(message, sendResponse, openAndAutoFillPlatform) {
  if (message?.type !== 'FOLLOWDESK_EXTENSION_DISPATCH') return undefined
  void (async () => {
    try {
      const items = Array.isArray(message.items) ? message.items : [message]
      const results = []
      for (const item of items) results.push(await openAndAutoFillPlatform(item))
      await chrome.action.setBadgeText({ text: String(results.length) })
      await chrome.action.setBadgeBackgroundColor({ color: '#8b5cf6' })
      setTimeout(() => { void chrome.action.setBadgeText({ text: '' }) }, 4000)
      sendResponse({ success: true, results })
    } catch (error) {
      sendResponse({ success: false, error: error instanceof Error ? error.message : String(error) })
    }
  })()
  return true
}
