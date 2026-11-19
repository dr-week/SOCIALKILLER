import { LOCAL_APP_ORIGIN } from './constants.js'

export async function reportExtensionLog(payload) {
  try {
    await fetch(`${LOCAL_APP_ORIGIN}/api/social/log`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
  } catch (error) {
    console.warn('[The Social Base Extension Logger] Could not sync log to server:', error)
  }
}

export async function logExtensionError(where, error, platformId = 'extension') {
  const entry = {
    at: new Date().toISOString(), where,
    message: error instanceof Error ? error.message : String(error)
  }
  console.warn('[The Social Base]', where, entry.message)
  try {
    const { followdeskErrors = [] } = await chrome.storage.local.get('followdeskErrors')
    followdeskErrors.push(entry)
    await chrome.storage.local.set({ followdeskErrors: followdeskErrors.slice(-50) })
  } catch {}
  try {
    await fetch(`${LOCAL_APP_ORIGIN}/api/social/client-error`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ where, message: entry.message, platformId }),
      signal: AbortSignal.timeout(2000)
    })
  } catch {}
}
