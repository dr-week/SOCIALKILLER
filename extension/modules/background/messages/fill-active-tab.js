export function handleFillActiveTab(message, sendResponse) {
  if (message?.type !== 'FOLLOWDESK_FILL_ACTIVE_TAB') return undefined
  void fillActiveTab(message.payload || {}).then(
    result => sendResponse({ success: true, result }),
    error => sendResponse({ success: false, error: error instanceof Error ? error.message : String(error) })
  )
  return true
}

async function fillActiveTab(payload) {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
  if (!tab?.id) throw new Error('No active tab found.')
  await chrome.scripting.executeScript({ target: { tabId: tab.id }, files: ['modules/injections/social-autoposter.js'] })
  try {
    return await chrome.tabs.sendMessage(tab.id, { type: 'FOLLOWDESK_AUTO_FILL_POST', payload })
  } catch {
    const results = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: async currentPayload => typeof window.__followdeskAutoFillCurrentPage === 'function'
        ? await window.__followdeskAutoFillCurrentPage(currentPayload)
        : { success: false, error: 'Reload page once to mount injector.' },
      args: [payload]
    })
    return results?.[0]?.result
  }
}
