/**
 * FollowDesk Companion Popup Controller (<100 lines)
 * Minimal, Clutter-Free, Automatic.
 */
import { ADAPTIVE_PLATFORM_THEMES } from './modules/harvester/page-harvester.js'
import { focusOrOpenFollowDeskApp, ensureAppOnlineWithAutoLaunch } from './modules/session/app-launcher.js'
import { ALGORITHM_TIPS, detectActivePlatform, applyPlatformTheme } from './modules/popup/popup-theme.js'
import { captureVisibleScreenshot } from './modules/harvester/screenshot-capture.js'
import { initPopupWorkflows } from './modules/popup/popup-workflows.js'
import { initPopupActions } from './modules/popup/popup-actions.js'

document.addEventListener('DOMContentLoaded', async () => {
  const syncStatus = document.getElementById('syncStatus')
  const siteIcon = document.getElementById('siteIcon')
  const siteName = document.getElementById('siteName')
  const detectedAccount = document.getElementById('detectedAccount')
  const algoTip = document.getElementById('algoTip')
  const primarySmartActionBtn = document.getElementById('primarySmartActionBtn')
  const instagramScannerWrap = document.getElementById('instagramScannerWrap')
  const extractIgBtn = document.getElementById('extractIgBtn')
  const openAppBtn = document.getElementById('openAppBtn')
  const captureScreenshotBtn = document.getElementById('captureScreenshotBtn')
  const errorArea = document.getElementById('errorArea')
  const successArea = document.getElementById('successArea')

  let activeTab = null

  function showAlert(type, msg) {
    if (errorArea) errorArea.style.display = 'none'
    if (successArea) successArea.style.display = 'none'
    const box = type === 'error' ? errorArea : successArea
    if (!box) return
    box.textContent = msg
    box.style.display = 'flex'
    setTimeout(() => { if (box.textContent === msg) box.style.display = 'none' }, 4000)
  }

  openAppBtn?.addEventListener('click', () => focusOrOpenFollowDeskApp())
  captureScreenshotBtn?.addEventListener('click', async () => {
    captureScreenshotBtn.disabled = true
    try {
      if (!activeTab?.windowId) throw new Error('Open a browser tab and try again.')
      await captureVisibleScreenshot(activeTab.windowId)
      showAlert('success', '📷 Visible tab screenshot opened in a new tab.')
    } catch (error) {
      showAlert('error', error instanceof Error ? error.message : 'Could not capture this tab.')
    } finally {
      captureScreenshotBtn.disabled = false
    }
  })

  ensureAppOnlineWithAutoLaunch(syncStatus)

  try {
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true })
    activeTab = tabs[0] || null
  } catch {}

  const workflows = initPopupWorkflows({ getActiveTab: () => activeTab })
  await workflows.loadInteractionWorkflows()

  const detectedPlatformKey = detectActivePlatform(activeTab?.url || '')
  const theme = ADAPTIVE_PLATFORM_THEMES[detectedPlatformKey] || ADAPTIVE_PLATFORM_THEMES.x
  applyPlatformTheme(theme)

  if (siteIcon) siteIcon.textContent = theme.icon
  if (siteName) siteName.textContent = theme.name
  if (algoTip) algoTip.textContent = ALGORITHM_TIPS[detectedPlatformKey] || ALGORITHM_TIPS.x
  if (primarySmartActionBtn) primarySmartActionBtn.textContent = `▶ Start Post: ${theme.name}`

  const developerHeroCard = document.getElementById('developerHeroCard')
  const developerActionStack = document.getElementById('developerActionStack')
  const isIg = detectedPlatformKey === 'instagram'
  if (developerHeroCard) developerHeroCard.style.display = isIg ? 'none' : 'flex'
  if (developerActionStack) developerActionStack.style.display = isIg ? 'none' : 'flex'
  if (instagramScannerWrap) instagramScannerWrap.style.display = isIg ? 'flex' : 'none'

  document.getElementById('igSyncBtn')?.addEventListener('click', () => {
    showAlert('success', '🔄 Syncing Instagram profile to The Social Base...')
    focusOrOpenFollowDeskApp('?app=audience')
  })

  try {
    const { recognizedPlatformAccounts = {} } = await chrome.storage.local.get('recognizedPlatformAccounts')
    const accountInfo = recognizedPlatformAccounts[detectedPlatformKey]
    if (detectedAccount) detectedAccount.textContent = accountInfo?.handle || '@ready'
  } catch {}

  const actions = initPopupActions({ activeTab, detectedPlatformKey, theme, showAlert })
  await actions.loadPostFromApp()

  extractIgBtn?.addEventListener('click', () => {
    focusOrOpenFollowDeskApp('?app=audience')
  })
})
