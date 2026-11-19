/**
 * FollowDesk Extension App Bridge & Auto-Launch Service (<100 lines)
 * Manages checking dashboard status, automatic tab focusing, and app connectivity.
 */

export async function focusOrOpenFollowDeskApp(path = '') {
  const { activeFrontendPort = 5199 } = await chrome.storage.local.get('activeFrontendPort')
  const targetUrl = `http://127.0.0.1:${activeFrontendPort}/${path.replace(/^\//, '')}`
  try {
    const tabs = await chrome.tabs.query({ url: ['http://127.0.0.1/*', 'http://localhost/*'] })
    const appTab = tabs.find(tab => /SOCIALKILLER|The Social Base/i.test(tab.title || ''))
    if (appTab?.id) {
      await chrome.tabs.update(appTab.id, { active: true })
      if (appTab.windowId) await chrome.windows.update(appTab.windowId, { focused: true })
      return true
    }
    await chrome.tabs.create({ url: targetUrl })
    return true
  } catch {
    chrome.tabs.create({ url: targetUrl })
    return false
  }
}

export async function verifyAppBackendOnline(apiUrl = 'http://127.0.0.1:4174/api/health') {
  try {
    const res = await fetch(apiUrl, { signal: AbortSignal.timeout(2000) })
    return res.ok
  } catch {
    return false
  }
}

export async function ensureAppOnlineWithAutoLaunch(syncStatusElement = null) {
  const isOnline = await verifyAppBackendOnline()
  if (isOnline) {
    if (syncStatusElement) syncStatusElement.textContent = 'App Online ●'
    return true
  }

  if (syncStatusElement) syncStatusElement.textContent = 'App Offline ○'
  return false
}
