/**
 * FollowDesk Companion Popup — Instagram Scanner & Target Profile Controller (<130 lines)
 */
import { resolveInstagramTab, extractProfileUsernameFromUrl } from '../session/tab-service.js'
import { resolveSessionCookies } from '../session/cookie-service.js'
import { syncToBackend } from '../session/sync-service.js'
import {
  cloneInstagramPageSnapshot,
  executeFullFollowerExtraction,
  fetchLoggedInUsernameLabel
} from './popup-scanner-helpers.js'

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
  const { dsUserId, csrfToken } = await resolveSessionCookies()
  let targetUsername = extractProfileUsernameFromUrl(igTab?.url)

  if (loggedInUsername) {
    fetchLoggedInUsernameLabel(dsUserId, csrfToken).then((label) => {
      loggedInUsername.textContent = label
    })
  }

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

  updateTargetCard(targetUsername || null, Boolean(targetUsername))
  if (extractBtn) extractBtn.disabled = !igTab

  clonePageBtn?.addEventListener('click', async () => {
    if (!igTab?.id) return showAlert('error', 'Open an Instagram tab first to snapshot.')
    clonePageBtn.disabled = true
    try {
      if (await cloneInstagramPageSnapshot(igTab, targetUsername)) {
        showAlert('success', 'Cloned DOM snapshot saved to SOCIALKILLER!')
      }
    } catch (e) {
      showAlert('error', e instanceof Error ? e.message : 'Clone failed.')
    } finally {
      clonePageBtn.disabled = false
    }
  })

  harvestModalBtn?.addEventListener('click', () => {
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
      if (synced) showAlert('success', 'Synced test payload to SOCIALKILLER!')
      else throw new Error('Backend offline on port 4174.')
    } catch (err) {
      showAlert('error', err instanceof Error ? err.message : 'Sync failed')
    }
  })

  extractBtn?.addEventListener('click', async () => {
    extractBtn.disabled = true
    if (stopBtn) stopBtn.style.display = 'flex'
    try {
      const output = await executeFullFollowerExtraction({ dsUserId, csrfToken, targetUsername })
      showAlert('success', `Synced ${output.followers.length} followers & ${output.following.length} following!`)
    } catch (err) {
      showAlert('error', err instanceof Error ? err.message : String(err))
    } finally {
      if (stopBtn) stopBtn.style.display = 'none'
      extractBtn.disabled = false
    }
  })
}
