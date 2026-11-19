/**
 * Chrome Tab & Window Resolver Service
 * Discovers active Instagram tabs across open windows and tabs.
 */

/**
 * Resolves the active or nearest open Instagram tab.
 * @returns {Promise<chrome.tabs.Tab|null>}
 */
export async function resolveInstagramTab() {
  // 1. Try active tab in current window
  try {
    const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true })
    if (activeTab?.url && (activeTab.url.includes('instagram.com') || activeTab.url.includes('www.instagram.com'))) {
      return activeTab
    }
  } catch {}

  // 2. Fallback: Search all open tabs across windows
  try {
    const allIgTabs = await chrome.tabs.query({ url: '*://*.instagram.com/*' })
    if (allIgTabs && allIgTabs.length > 0) {
      return allIgTabs[0]
    }
  } catch {}

  // 3. If none exists, do not auto-open. User must open or click to start.
  return null
}

/**
 * Single-tab concurrency manager.
 * Guarantees strictly ONE active composer/automation tab is managed at any given time.
 */
let activeDispatchTabId = null

export function getActiveDispatchTabId() {
  return activeDispatchTabId
}

export function setActiveDispatchTabId(tabId) {
  activeDispatchTabId = tabId
}

/**
 * Extracts username from Instagram profile URL (e.g. /hyperdrive_studio/ or /sidequest_ceo/)
 * @param {string} url
 * @returns {string|null}
 */
export function extractProfileUsernameFromUrl(url) {
  if (!url) return null
  try {
    const parsed = new URL(url)
    const path = parsed.pathname.replace(/^\/+|\/+$/g, '')
    const parts = path.split('/')
    if (parts.length >= 1 && parts[0]) {
      const candidate = parts[0].toLowerCase()
      const reserved = ['explore', 'reels', 'stories', 'direct', 'accounts', 'developer', 'about', 'p', 'reel', 'tv']
      if (!reserved.includes(candidate) && /^[a-zA-Z0-9._]{1,30}$/.test(candidate)) {
        return candidate
      }
    }
  } catch {}
  return null
}

