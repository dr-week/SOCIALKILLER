/**
 * Sync & Dispatch Service for FollowDesk Companion
 * Transmits extracted datasets to local API server and active web app tabs.
 */

const SYNC_ENDPOINTS = [
  'http://127.0.0.1:4174/api/instagram/sync',
  'http://127.0.0.1:5199/api/instagram/sync',
  'http://127.0.0.1:5173/api/instagram/sync'
]

/**
 * Dispatches an account payload to the FollowDesk backend with fallback.
 * @param {{ username: string, followers: any[], following: any[], partial?: boolean }} payload
 * @returns {Promise<boolean>}
 */
export async function syncToBackend(payload) {
  for (const endpoint of SYNC_ENDPOINTS) {
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      if (res.ok) return true
    } catch {}
  }
  return false
}

/**
 * Injects payload directly into open FollowDesk web app tabs for zero-latency instant display.
 * @param {{ username: string, followers: any[], following: any[] }} payload
 */
export async function injectDirectToAppTabs(payload) {
  try {
    const appTabs = await chrome.tabs.query({ url: ['*://127.0.0.1:5173/*', '*://localhost:5173/*'] })
    for (const targetTab of appTabs) {
      if (targetTab.id) {
        await chrome.scripting.executeScript({
          target: { tabId: targetTab.id },
          func: (data) => {
            try {
              const old = localStorage.getItem('followdesk-current')
              if (old) {
                localStorage.setItem('followdesk-previous', old)
              }
              const accData = {
                followers: data.followers,
                following: data.following,
                username: data.username || 'user',
                importedAt: new Date().toISOString()
              }
              localStorage.setItem('followdesk-current', JSON.stringify(accData))
              try {
                const accountsMap = JSON.parse(localStorage.getItem('followdesk-accounts') || '{}')
                if (accData.username) {
                  accountsMap[accData.username.toLowerCase()] = accData
                  localStorage.setItem('followdesk-accounts', JSON.stringify(accountsMap))
                }
              } catch {}
              window.location.reload()
            } catch (e) {
              console.error('Direct localStorage injection error:', e)
            }
          },
          args: [payload]
        })
      }
    }
  } catch (err) {
    console.warn('Direct tab injection error:', err)
  }
}

/**
 * Saves a JSON backup file to the user's downloads folder.
 * @param {any} data
 * @param {string} username
 */
export function triggerJsonDownload(data, username) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const downloadUrl = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = downloadUrl
  a.download = `followdesk-${username || 'instagram'}-export.json`
  a.click()
  URL.revokeObjectURL(downloadUrl)
}

/**
 * Focuses or opens the FollowDesk web app tab.
 */
export async function focusFollowDeskApp() {
  try {
    const appTabs = await chrome.tabs.query({ url: ['*://127.0.0.1:5199/*', '*://localhost:5199/*', '*://127.0.0.1:5173/*', '*://localhost:5173/*'] })
    if (appTabs && appTabs.length > 0 && appTabs[0].id) {
      await chrome.tabs.update(appTabs[0].id, { active: true })
      if (appTabs[0].windowId) await chrome.windows.update(appTabs[0].windowId, { focused: true })
    } else {
      await chrome.tabs.create({ url: 'http://127.0.0.1:5199/' })
    }
  } catch {
    await chrome.tabs.create({ url: 'http://127.0.0.1:5199/' })
  }
}
