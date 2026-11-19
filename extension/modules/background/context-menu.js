import { logExtensionError } from './extension-logger.js'
import { LOCAL_APP_ORIGIN } from './constants.js'

export function registerContextMenuHandler() {
  chrome.contextMenus.onClicked.addListener(async (info, tab) => {
    if (info.menuItemId !== 'followdesk_share_selection') return
    const pageUrl = tab?.url || ''
    const draft = {
      topic: tab?.title || 'Developer Update',
      rawNotes: info.selectionText?.trim() ? `${info.selectionText.trim()}\n\nSource: ${pageUrl}` : `Check out: ${pageUrl}`,
      savedAt: new Date().toISOString()
    }
    await chrome.storage.local.set({ followdeskQuickDraft: draft })
    await createDraft(draft)
    await showNewDraftBadge()
  })
}

async function createDraft(draft) {
  try {
    await fetch(`${LOCAL_APP_ORIGIN}/api/social/posts`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: draft.topic, topic: draft.topic, rawNotes: draft.rawNotes,
        platforms: ['x', 'linkedin', 'reddit', 'github', 'discord', 'devto', 'ai_registry'],
        publishNow: false
      })
    })
  } catch (error) { await logExtensionError('context menu draft', error) }
}

async function showNewDraftBadge() {
  await chrome.action.setBadgeText({ text: 'NEW' })
  await chrome.action.setBadgeBackgroundColor({ color: '#10b981' })
  setTimeout(() => { void chrome.action.setBadgeText({ text: '' }) }, 4000)
}
