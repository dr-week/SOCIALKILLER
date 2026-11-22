import {
  focusFollowDeskApp,
  injectDirectToAppTabs,
  syncToBackend,
  triggerJsonDownload
} from '../session/sync-service.js'
import { resolveInstagramTab } from '../session/tab-service.js'

export async function fetchLoggedInUsernameLabel(dsUserId, csrfToken) {
  if (!dsUserId) return 'Ready'
  try {
    const resp = await fetch(`https://www.instagram.com/api/v1/users/${dsUserId}/info/`, {
      headers: {
        'X-IG-App-ID': '936619743392459',
        Accept: 'application/json',
        ...(csrfToken ? { 'X-CSRFToken': csrfToken } : {})
      },
      credentials: 'include'
    })
    if (resp.ok) {
      const data = await resp.json()
      if (data?.user?.username) return `@${data.user.username}`
    }
  } catch {}
  return `ID:${dsUserId.slice(0, 6)}`
}

export async function cloneInstagramPageSnapshot(igTab, targetUsername) {
  const results = await chrome.scripting.executeScript({
    target: { tabId: igTab.id },
    func: () => ({
      url: window.location.href,
      title: document.title,
      html: document.documentElement.outerHTML,
      scrollPosition: { x: window.scrollX, y: window.scrollY }
    })
  })
  const pageData = results?.[0]?.result
  if (!pageData) throw new Error('Could not capture page DOM.')
  const resp = await fetch('http://127.0.0.1:4174/api/dev/clone', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      url: pageData.url,
      title: pageData.title,
      username: targetUsername || 'instagram_tab',
      html: pageData.html,
      metadata: { scrollPosition: pageData.scrollPosition }
    })
  })
  return resp.ok
}

export async function executeFullFollowerExtraction({ dsUserId, csrfToken, targetUsername }) {
  const igTab = await resolveInstagramTab()
  if (!igTab?.id) throw new Error('Open https://www.instagram.com first.')
  await chrome.scripting.executeScript({ target: { tabId: igTab.id }, files: ['extractor.js'] })
  const results = await chrome.scripting.executeScript({
    target: { tabId: igTab.id },
    func: async (payload) => window.__followdeskExtractor(payload),
    args: [{ userId: dsUserId, csrfToken, targetUsername }]
  })
  const output = results?.[0]?.result
  if (!output?.success) throw new Error(output?.error || 'Extraction failed.')
  const syncPayload = {
    followers: output.followers,
    following: output.following,
    username: output.username,
    partial: output.partial || false
  }
  await syncToBackend(syncPayload)
  await injectDirectToAppTabs(syncPayload)
  triggerJsonDownload(output, output.username)
  await focusFollowDeskApp()
  return output
}
