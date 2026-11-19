import { LOCAL_APP_ORIGIN } from './constants.js'

let lastLaunchAttemptAt = 0

export async function ensureAppRunning() {
  try {
    const response = await fetch(`${LOCAL_APP_ORIGIN}/api/social/platforms`, { signal: AbortSignal.timeout(1500) })
    if (response.ok) return true
  } catch {}
  if (Date.now() - lastLaunchAttemptAt < 30000) return false
  lastLaunchAttemptAt = Date.now()
  try {
    const result = await chrome.runtime.sendNativeMessage('com.followdesk.host', { action: 'ensure_running' })
    return Boolean(result?.running)
  } catch (error) {
    console.warn('[The Social Base] native host unavailable (run scripts/install-windows.ps1 -ExtensionId <id>):', error?.message)
    return false
  }
}

export function registerAppLifecycle() {
  chrome.runtime.onStartup.addListener(() => { void ensureAppRunning() })
  void ensureAppRunning()
  chrome.runtime.onInstalled.addListener(async () => {
    void ensureAppRunning()
    await chrome.alarms.create('followdesk_keep_alive_alarm', { periodInMinutes: 60 })
    await chrome.alarms.clear('followdesk_queue_poll_alarm')
    chrome.contextMenus.removeAll(() => chrome.contextMenus.create({
      id: 'followdesk_share_selection', title: '🚀 Broadcast via The Social Base', contexts: ['selection', 'page']
    }))
  })
}
