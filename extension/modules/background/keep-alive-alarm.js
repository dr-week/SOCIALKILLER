import { LOCAL_APP_ORIGIN } from './constants.js'

export function registerKeepAliveAlarm() {
  chrome.alarms.onAlarm.addListener(async alarm => {
    if (alarm.name !== 'followdesk_keep_alive_alarm') return
    const { autoKeepAliveEnabled = false } = await chrome.storage.local.get('autoKeepAliveEnabled')
    if (!autoKeepAliveEnabled) return
    try {
      await fetch(`${LOCAL_APP_ORIGIN}/api/social/keep-alive`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ platformId: null })
      })
    } catch {}
  })
}
