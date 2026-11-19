/**
 * FollowDesk Companion Popup — Instagram Scanner & Target Profile Controller
 * Dedicated module (<240 lines) handling Instagram session detection, target profile
 * switching, full network follower scanning, and onscreen modal harvesting.
 */
import { resolveInstagramTab, extractProfileUsernameFromUrl } from './tab-service.js'
import { resolveSessionCookies } from './cookie-service.js'
import { syncToBackend, injectDirectToAppTabs, triggerJsonDownload, focusFollowDeskApp } from './sync-service.js'

export async function initPopupScannerController({ showAlert }) {
  const tabStatus = document.getElementById('tabStatus')
  const extractBtn = document.getElementById('extractBtn')
  const btnText = document.getElementById('btnText')
  const testSyncBtn = document.getElementById('testSyncBtn')
  const clonePageBtn = document.getElementById('clonePageBtn')
  const harvestModalBtn = document.getElementById('harvestModalBtn')
  const stopBtn = document.getElementById('stopBtn')

  const targetProfileUsername = document.getElementById('targetProfileUsername')
  const targetProfileType = document.getElementById('targetProfileType')
  const targetProfileAvatar = document.getElementById('targetProfileAvatar')
  const customTargetInput = document.getElementById('customTargetInput')
  const setTargetBtn = document.getElementById('setTargetBtn')
  const resetToSelfBtn = document.getElementById('resetToSelfBtn')
  const privateProfileWarning = document.getElementById('privateProfileWarning')
  const quickSwitchSelf = document.getElementById('quickSwitchSelf')
  const loggedInUsername = document.getElementById('loggedInUsername')

  const progressWrap = document.getElementById('progressWrap')
  const progressStage = document.getElementById('progressStage')
  const progressStats = document.getElementById('progressStats')
  const progressBarFill = document.getElementById('progressBarFill')

  let igTab = await resolveInstagramTab()
  let { dsUserId, csrfToken } = await resolveSessionCookies()
  let targetUsername = extractProfileUsernameFromUrl(igTab?.url)

  async function resolveLoggedInUsername() {
    if (!loggedInUsername) return
    if (!dsUserId) {
      loggedInUsername.textContent = 'Ready'
      return
    }
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
        if (data?.user?.username) {
          loggedInUsername.textContent = `@${data.user.username}`
          return
        }
      }
    } catch {}
    loggedInUsername.textContent = `ID:${dsUserId.slice(0, 6)}`
  }

  resolveLoggedInUsername()

  function updateTargetCard(user, isOpenedTab = false) {
    if (user) {
      targetUsername = user.toLowerCase().replace(/^@/, '')
      if (targetProfileUsername) targetProfileUsername.textContent = `@${targetUsername}`
      if (targetProfileAvatar) targetProfileAvatar.textContent = targetUsername.slice(0, 1).toUpperCase()
      if (targetProfileType) targetProfileType.textContent = isOpenedTab ? 'ACTIVE TAB' : 'TARGET'
      if (btnText) btnText.textContent = `Scan @${targetUsername}`
      if (tabStatus) tabStatus.textContent = `Target: @${targetUsername}`
      if (resetToSelfBtn) resetToSelfBtn.style.display = 'inline-block'
    } else {
      targetUsername = null
      if (targetProfileUsername) targetProfileUsername.textContent = 'Logged-in Account'
      if (targetProfileAvatar) targetProfileAvatar.textContent = 'MY'
      if (targetProfileType) targetProfileType.textContent = 'SELF'
      if (btnText) btnText.textContent = 'Export Followers'
      if (tabStatus) tabStatus.textContent = igTab ? 'Instagram tab ready' : 'Open instagram.com to scan'
      if (resetToSelfBtn) resetToSelfBtn.style.display = 'none'
      if (privateProfileWarning) privateProfileWarning.style.display = 'none'
    }
  }

  const resetToSelf = () => {
    if (customTargetInput) customTargetInput.value = ''
    updateTargetCard(null, false)
  }

  resetToSelfBtn?.addEventListener('click', resetToSelf)
  quickSwitchSelf?.addEventListener('click', resetToSelf)
  setTargetBtn?.addEventListener('click', () => {
    const val = (customTargetInput?.value || '').trim()
    if (val) updateTargetCard(val, false)
  })

  if (targetUsername) updateTargetCard(targetUsername, true)
  else updateTargetCard(null, false)

  if (extractBtn) extractBtn.disabled = !igTab

  clonePageBtn?.addEventListener('click', async () => {
    if (!igTab?.id) {
      showAlert('error', 'Open an Instagram tab first to snapshot.')
      return
    }
    clonePageBtn.disabled = true
    try {
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
      if (resp.ok) showAlert('success', 'Cloned DOM snapshot saved to The Social Base!')
    } catch (e) {
      showAlert('error', e instanceof Error ? e.message : 'Clone failed.')
    } finally {
      clonePageBtn.disabled = false
    }
  })

  harvestModalBtn?.addEventListener('click', async () => {
    showAlert('info', 'Automatic follower-dialog scanning is unavailable. Import your Instagram data export for a complete, account-scoped snapshot.')
  })

  stopBtn?.addEventListener('click', async () => {
    if (!igTab?.id) return
    await chrome.scripting.executeScript({
      target: { tabId: igTab.id },
      func: () => { window.__followdeskExtractorStopRequested = true }
    }).catch(() => {})
  })

  chrome.runtime.onMessage.addListener((msg) => {
    if (msg.type === 'FOLLOWDESK_PROGRESS') {
      if (tabStatus) tabStatus.textContent = msg.message
      if (progressWrap) progressWrap.style.display = 'block'
      if (progressStage) progressStage.textContent = (msg.stage || 'SCANNING').toUpperCase()
      if (progressStats && msg.count != null) {
        progressStats.textContent = `${msg.count} loaded`
        if (progressBarFill) progressBarFill.style.width = `${Math.min(95, Math.max(15, msg.count % 100))}%`
      }
    }
  })

  testSyncBtn?.addEventListener('click', async () => {
    try {
      const synced = await syncToBackend({
        username: 'test_creator',
        followers: [{ username: 'alex_creator', href: 'https://www.instagram.com/alex_creator/' }],
        following: [{ username: 'alex_creator', href: 'https://www.instagram.com/alex_creator/' }]
      })
      if (synced) showAlert('success', 'Synced test payload to The Social Base!')
      else throw new Error('Backend offline on port 4174.')
    } catch (err) {
      showAlert('error', err instanceof Error ? err.message : 'Sync failed')
    }
  })

  extractBtn?.addEventListener('click', async () => {
    extractBtn.disabled = true
    if (stopBtn) stopBtn.style.display = 'flex'
    try {
      igTab = await resolveInstagramTab()
      if (!igTab?.id) throw new Error('Open https://www.instagram.com first.')
      await chrome.scripting.executeScript({ target: { tabId: igTab.id }, files: ['extractor.js'] })
      const results = await chrome.scripting.executeScript({
        target: { tabId: igTab.id },
        func: async (payload) => window.__followdeskExtractor(payload),
        args: [{ userId: dsUserId, csrfToken, targetUsername }]
      })
      const output = results?.[0]?.result
      if (!output?.success) throw new Error(output?.error || 'Extraction failed.')
      const syncPayload = { followers: output.followers, following: output.following, username: output.username, partial: output.partial || false }
      await syncToBackend(syncPayload)
      await injectDirectToAppTabs(syncPayload)
      triggerJsonDownload(output, output.username)
      showAlert('success', `Synced ${output.followers.length} followers & ${output.following.length} following!`)
      await focusFollowDeskApp()
    } catch (err) {
      showAlert('error', err instanceof Error ? err.message : String(err))
    } finally {
      if (stopBtn) stopBtn.style.display = 'none'
      extractBtn.disabled = false
    }
  })
}
