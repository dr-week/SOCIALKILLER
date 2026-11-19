import { buildPlatformComposerUrl } from './platform-urls.js'

export function createPlatformDispatcher(reportExtensionLog) {
  let activeDispatchTabId = null

  return async function openAndAutoFillPlatform({
    platformId, title = '', content = '', subreddit = 'r/webdev',
    autoClickSubmit = false, postId = null
  }) {
    const targetUrl = buildPlatformComposerUrl(platformId, title, content, subreddit)
    const { pendingAutoPosts = {} } = await chrome.storage.local.get('pendingAutoPosts')
    pendingAutoPosts[platformId] = { platformId, title, content, autoClickSubmit, postId, timestamp: Date.now() }
    await chrome.storage.local.set({ pendingAutoPosts })

    let targetTabId = await findPlatformTab(platformId, targetUrl)
    if (!targetTabId) targetTabId = await reuseDispatchTab(targetUrl, activeDispatchTabId)
    if (!targetTabId) targetTabId = (await chrome.tabs.create({ url: targetUrl, active: true })).id
    activeDispatchTabId = targetTabId
    if (targetTabId) watchTabAndFill(targetTabId, { platformId, title, content, autoClickSubmit, postId }, reportExtensionLog)
    return { ok: true, tabId: targetTabId, platformId, targetUrl }
  }
}

async function findPlatformTab(platformId, targetUrl) {
  try {
    const host = platformId === 'x' ? 'x.com' : `${platformId}.*`
    const [tab] = await chrome.tabs.query({ url: [`*://*.${host}/*`] })
    if (tab?.id) {
      await chrome.tabs.update(tab.id, { url: targetUrl, active: true })
      return tab.id
    }
  } catch {}
  return null
}

async function reuseDispatchTab(targetUrl, activeDispatchTabId) {
  try {
    if (!activeDispatchTabId) return null
    const tab = await chrome.tabs.get(activeDispatchTabId)
    if (!tab?.id) return null
    await chrome.tabs.update(tab.id, { url: targetUrl, active: true })
    return tab.id
  } catch {
    return null
  }
}

function watchTabAndFill(tabId, payload, reportExtensionLog) {
  const listener = async (updatedTabId, changeInfo) => {
    if (updatedTabId !== tabId || changeInfo.status !== 'complete') return
    chrome.tabs.onUpdated.removeListener(listener)
    try {
      await chrome.scripting.executeScript({ target: { tabId }, files: ['modules/injections/social-autoposter.js'] })
      await chrome.tabs.sendMessage(tabId, { type: 'FOLLOWDESK_AUTO_FILL_POST', payload })
    } catch (error) {
      await reportExtensionLog({
        platformId: payload.platformId, action: 'Content Script Injection Error', status: 'error',
        message: `Tab ${tabId} could not receive auto-fill message: ${error.message}`
      })
    }
  }
  chrome.tabs.onUpdated.addListener(listener)
}
