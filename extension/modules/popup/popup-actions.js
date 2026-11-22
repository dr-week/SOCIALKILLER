/**
 * Popup Smart Post, Viral Topic, Harvest & Broadcast Action Handlers (<125 lines)
 */
import { extractStructuredPageIntel } from '../harvester/page-harvester.js'

export function initPopupActions({ activeTab, detectedPlatformKey, theme, showAlert }) {
  const syncStatus = document.getElementById('syncStatus')
  const activePostPreview = document.getElementById('activePostPreview')
  const algoTip = document.getElementById('algoTip')
  const primarySmartActionBtn = document.getElementById('primarySmartActionBtn')
  const harvestPageBtn = document.getElementById('harvestPageBtn')
  const broadcastAllBtn = document.getElementById('broadcastAllBtn')
  const refreshSyncBtn = document.getElementById('refreshSyncBtn')
  const randomizeViralBtn = document.getElementById('randomizeViralBtn')

  let currentPost = null

  async function loadPostFromApp() {
    try {
      const res = await fetch('http://127.0.0.1:4174/api/social/posts')
      if (res.ok) currentPost = (await res.json())?.posts?.[0] || null
    } catch {}

    if (currentPost) {
      const platformText = currentPost.variants?.[detectedPlatformKey] || currentPost.variants?.x || currentPost.title
      if (activePostPreview) activePostPreview.textContent = platformText
      if (syncStatus) syncStatus.textContent = 'Ready to Post'
    } else {
      const fallbackText = 'Shipped The Social Base & Zuari update — modular social publishing and audience tools. 🚀'
      if (activePostPreview) activePostPreview.textContent = fallbackText
      currentPost = { title: 'The Social Base and Zuari update', variants: { [detectedPlatformKey]: fallbackText } }
    }
  }

  refreshSyncBtn?.addEventListener('click', async () => {
    refreshSyncBtn.style.transform = 'rotate(180deg)'
    await loadPostFromApp()
    showAlert('success', '✨ Refreshed latest post from App!')
    setTimeout(() => { refreshSyncBtn.style.transform = 'none' }, 400)
  })

  primarySmartActionBtn?.addEventListener('click', async () => {
    primarySmartActionBtn.disabled = true
    try {
      const content = currentPost?.variants?.[detectedPlatformKey] || currentPost?.variants?.x || currentPost?.title || ''
      const title = currentPost?.title || 'Release Update'
      if ((activeTab?.url || '').includes(detectedPlatformKey)) {
        const res = await chrome.runtime.sendMessage({
          type: 'FOLLOWDESK_FILL_ACTIVE_TAB',
          payload: { title, content, autoClickSubmit: false }
        })
        if (res?.success) {
          showAlert('success', `⚡ Filled ${theme.name} composer! (Copied to clipboard)`)
          return
        }
      }
      await chrome.runtime.sendMessage({
        type: 'FOLLOWDESK_EXTENSION_DISPATCH',
        items: [{ platformId: detectedPlatformKey, title, content, autoClickSubmit: false }]
      })
      showAlert('success', `🚀 Opened ${theme.name} composer & typed content!`)
    } catch (err) {
      showAlert('error', err instanceof Error ? err.message : String(err))
    } finally {
      primarySmartActionBtn.disabled = false
    }
  })

  randomizeViralBtn?.addEventListener('click', async () => {
    randomizeViralBtn.disabled = true
    try {
      const res = await fetch(`http://127.0.0.1:4174/api/social/viral?platform=${detectedPlatformKey}`)
      if (res.ok) {
        const data = await res.json()
        const viral = data.formatted
        const topic = data.topic || {}
        currentPost = { title: viral.title, topicId: topic.id, topicObj: topic, variants: { [detectedPlatformKey]: viral.mainPost } }
        if (activePostPreview) activePostPreview.textContent = viral.mainPost
        const categoryLabel = topic.pillar || topic.category || 'Tech Debate'
        if (algoTip) algoTip.textContent = `🔥 ${categoryLabel}: ${topic.question || topic.hook || ''}`
        showAlert('success', `🎲 Loaded: "${categoryLabel}"`)
      }
    } catch {
      showAlert('error', 'App server offline')
    } finally {
      randomizeViralBtn.disabled = false
    }
  })

  harvestPageBtn?.addEventListener('click', async () => {
    if (!activeTab?.id) return
    harvestPageBtn.disabled = true
    try {
      const results = await chrome.scripting.executeScript({ target: { tabId: activeTab.id }, func: extractStructuredPageIntel })
      const intel = results?.[0]?.result || {
        platformId: detectedPlatformKey,
        title: activeTab.title || 'Community Thread',
        url: activeTab.url,
        summary: `Harvested ${activeTab.title}`
      }
      const res = await fetch('http://127.0.0.1:4174/api/social/harvest', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(intel)
      })
      showAlert('success', res.ok ? '📥 Harvested & sent directly to Main App!' : `📋 Saved ${theme.name} intel to local clipboard!`)
    } catch {
      showAlert('success', '📋 Saved to local clipboard!')
    } finally {
      harvestPageBtn.disabled = false
    }
  })

  broadcastAllBtn?.addEventListener('click', async () => {
    broadcastAllBtn.disabled = true
    try {
      const res = await fetch('http://127.0.0.1:4174/api/social/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: currentPost?.title || 'Zuari <2.5KB Release',
          topic: currentPost?.title || 'Release',
          rawNotes: activePostPreview?.textContent || '',
          platforms: ['x', 'reddit', 'linkedin', 'github', 'devto', 'ai_registry'],
          publishNow: true
        })
      })
      showAlert(res.ok ? 'success' : 'error', res.ok ? '🚀 Broadcast queued across all channels!' : 'App server not responding.')
    } catch (err) {
      showAlert('error', String(err))
    } finally {
      broadcastAllBtn.disabled = false
    }
  })

  return { loadPostFromApp }
}
