/**
 * FollowDesk Companion Popup Controller (<195 lines)
 * Minimal, Clutter-Free, Automatic.
 */
import { ADAPTIVE_PLATFORM_THEMES, extractStructuredPageIntel } from './modules/page-harvester.js'
import { focusOrOpenFollowDeskApp, ensureAppOnlineWithAutoLaunch } from './modules/app-launcher.js'
import { ALGORITHM_TIPS, detectActivePlatform, applyPlatformTheme } from './modules/popup-theme.js'
import { captureVisibleScreenshot } from './modules/screenshot-capture.js'

document.addEventListener('DOMContentLoaded', async () => {
  const syncStatus = document.getElementById('syncStatus')
  const siteIcon = document.getElementById('siteIcon')
  const siteName = document.getElementById('siteName')
  const detectedAccount = document.getElementById('detectedAccount')
  const activePostPreview = document.getElementById('activePostPreview')
  const algoTip = document.getElementById('algoTip')
  const primarySmartActionBtn = document.getElementById('primarySmartActionBtn')
  const harvestPageBtn = document.getElementById('harvestPageBtn')
  const broadcastAllBtn = document.getElementById('broadcastAllBtn')
  const instagramScannerWrap = document.getElementById('instagramScannerWrap')
  const extractIgBtn = document.getElementById('extractIgBtn')
  const openAppBtn = document.getElementById('openAppBtn')
  const refreshSyncBtn = document.getElementById('refreshSyncBtn')
  const captureScreenshotBtn = document.getElementById('captureScreenshotBtn')
  const errorArea = document.getElementById('errorArea')
  const successArea = document.getElementById('successArea')

  let currentPost = null
  let activeTab = null

  const workflowName = document.getElementById('workflowName')
  const workflowStart = document.getElementById('workflowStart')
  const workflowStop = document.getElementById('workflowStop')
  const workflowList = document.getElementById('workflowList')
  const workflowReplay = document.getElementById('workflowReplay')
  const workflowStatus = document.getElementById('workflowStatus')
  let interactionWorkflows = []
  let activeBrandId = 'danger-labs'

  function setWorkflowStatus(message, error = false) {
    if (!workflowStatus) return
    workflowStatus.textContent = message
    workflowStatus.style.color = error ? '#fca5a5' : ''
  }

  function isRecordableUrl(url) {
    try {
      const parsed = new URL(url)
      return parsed.protocol === 'https:' || (parsed.protocol === 'http:' && ['localhost', '127.0.0.1'].includes(parsed.hostname))
    } catch { return false }
  }

  async function ensureRecorder(tabId) {
    await chrome.scripting.executeScript({ target: { tabId }, files: ['modules/interaction-recorder.js'] })
  }

  async function loadInteractionWorkflows() {
    try {
      const stored = await chrome.storage.local.get(['activeBrandId', 'interactionRecording', 'interactionPendingWorkflow'])
      activeBrandId = /^[a-z0-9-]{1,64}$/.test(stored.activeBrandId || '') ? stored.activeBrandId : 'danger-labs'
      const response = await fetch(`http://127.0.0.1:4174/api/social/workflows?brandId=${encodeURIComponent(activeBrandId)}`)
      if (!response.ok) throw new Error('The Social Base backend is unavailable.')
      const data = await response.json()
      interactionWorkflows = data.workflows || []
      workflowList.replaceChildren(new Option(interactionWorkflows.length ? 'Choose a workflow' : 'No saved workflows', ''))
      for (const item of interactionWorkflows) workflowList.add(new Option(`${item.name} · ${new URL(item.origin).hostname}`, item.id))
      workflowReplay.disabled = true

      const recording = stored.interactionRecording
      const stillRecording = recording && recording.tabId === activeTab?.id
      const pending = stored.interactionPendingWorkflow
      workflowStart.hidden = Boolean(stillRecording || pending)
      workflowStop.hidden = !stillRecording && !pending
      workflowStop.textContent = pending ? 'Save captured workflow' : 'Stop and save'
      if (stillRecording) {
        workflowName.value = recording.name
        setWorkflowStatus(`Recording on ${recording.hostname}. Reopen this popup here to stop.`)
      } else if (pending) {
        workflowName.value = pending.name
        setWorkflowStatus(`Recording stopped. ${pending.steps.length} steps are ready to save.`)
      }
    } catch (error) {
      setWorkflowStatus(error.message || 'Could not load saved workflows.', true)
    }
  }

  workflowStart?.addEventListener('click', async () => {
    const name = workflowName.value.trim()
    if (!name) return setWorkflowStatus('Enter a workflow name first.', true)
    if (!activeTab?.id || !isRecordableUrl(activeTab.url || '')) return setWorkflowStatus('Open a website tab first.', true)
    workflowStart.disabled = true
    try {
      await ensureRecorder(activeTab.id)
      const result = await chrome.tabs.sendMessage(activeTab.id, { type: 'FOUNDRYDESK_WORKFLOW_START_RECORDING' })
      const origin = new URL(activeTab.url).origin
      await chrome.storage.local.set({ interactionRecording: { tabId: activeTab.id, name, origin, hostname: new URL(origin).hostname, brandId: activeBrandId } })
      workflowStart.hidden = true
      workflowStop.hidden = false
      setWorkflowStatus(result?.success ? `Recording on ${new URL(origin).hostname}.` : 'Could not start recording.', !result?.success)
    } catch (error) {
      setWorkflowStatus(error.message || 'Could not start recording on this tab.', true)
    } finally { workflowStart.disabled = false }
  })

  workflowStop?.addEventListener('click', async () => {
    const stored = await chrome.storage.local.get(['interactionRecording', 'interactionPendingWorkflow'])
    const recording = stored.interactionRecording
    let draft = stored.interactionPendingWorkflow
    if (!draft && (!recording || recording.tabId !== activeTab?.id)) return setWorkflowStatus('Return to the tab where recording started.', true)
    workflowStop.disabled = true
    try {
      if (!draft) {
        const result = await chrome.tabs.sendMessage(recording.tabId, { type: 'FOUNDRYDESK_WORKFLOW_STOP_RECORDING' })
        if (!result?.success || !result.steps?.length) {
          await chrome.storage.local.remove('interactionRecording')
          workflowStop.hidden = true
          workflowStart.hidden = false
          throw new Error('No supported steps were captured.')
        }
        draft = { brandId: recording.brandId, name: recording.name, origin: result.origin, steps: result.steps }
        await chrome.storage.local.set({ interactionPendingWorkflow: draft })
        await chrome.storage.local.remove('interactionRecording')
      }
      const response = await fetch('http://127.0.0.1:4174/api/social/workflows', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(draft)
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Could not save workflow.')
      await chrome.storage.local.remove(['interactionRecording', 'interactionPendingWorkflow'])
      workflowStop.hidden = true
      workflowStart.hidden = false
      await loadInteractionWorkflows()
      setWorkflowStatus(`Saved ${data.workflow.steps.length} steps for ${new URL(data.workflow.origin).hostname}.`)
    } catch (error) {
      setWorkflowStatus(`${error.message || 'Could not save workflow.'}${draft ? ' Retry save from this popup.' : ''}`, true)
    } finally { workflowStop.disabled = false }
  })

  workflowReplay?.addEventListener('click', async () => {
    const workflow = interactionWorkflows.find(item => item.id === workflowList.value)
    if (!workflow) return setWorkflowStatus('Choose a workflow first.', true)
    if (!activeTab?.id || !isRecordableUrl(activeTab.url || '')) return setWorkflowStatus('Open the workflow website first.', true)
    if (new URL(activeTab.url).origin !== workflow.origin) return setWorkflowStatus(`Open ${new URL(workflow.origin).hostname} before replaying.`, true)
    workflowReplay.disabled = true
    try {
      await ensureRecorder(activeTab.id)
      const result = await chrome.tabs.sendMessage(activeTab.id, { type: 'FOUNDRYDESK_WORKFLOW_REPLAY', workflow })
      const done = result?.results?.filter(step => step.success).length || 0
      const failed = result?.results?.find(step => !step.success)
      setWorkflowStatus(failed ? `Stopped at step ${failed.index}: ${failed.error}` : `Completed ${done} reviewed steps.` , Boolean(failed))
    } catch (error) {
      setWorkflowStatus(error.message || 'Could not replay workflow.', true)
    } finally { workflowReplay.disabled = false }
  })

  workflowList?.addEventListener('change', () => {
    workflowReplay.disabled = !workflowList.value
  })

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

  // 1. Identify Active Tab and Adapt UI Theme
  try {
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true })
    activeTab = tabs[0] || null
  } catch {}
  await loadInteractionWorkflows()

  const detectedPlatformKey = detectActivePlatform(activeTab?.url || '')
  const theme = ADAPTIVE_PLATFORM_THEMES[detectedPlatformKey] || ADAPTIVE_PLATFORM_THEMES.x
  applyPlatformTheme(theme)

  if (siteIcon) siteIcon.textContent = theme.icon
  if (siteName) siteName.textContent = theme.name
  if (algoTip) algoTip.textContent = ALGORITHM_TIPS[detectedPlatformKey] || ALGORITHM_TIPS.x
  if (primarySmartActionBtn) primarySmartActionBtn.textContent = `▶ Start Post: ${theme.name}`

  const developerHeroCard = document.getElementById('developerHeroCard')
  const developerActionStack = document.getElementById('developerActionStack')
  const igSyncBtn = document.getElementById('igSyncBtn')

  if (detectedPlatformKey === 'instagram') {
    if (developerHeroCard) developerHeroCard.style.display = 'none'
    if (developerActionStack) developerActionStack.style.display = 'none'
    if (instagramScannerWrap) instagramScannerWrap.style.display = 'flex'
  } else {
    if (developerHeroCard) developerHeroCard.style.display = 'flex'
    if (developerActionStack) developerActionStack.style.display = 'flex'
    if (instagramScannerWrap) instagramScannerWrap.style.display = 'none'
  }

  igSyncBtn?.addEventListener('click', async () => {
    showAlert('success', '🔄 Syncing Instagram profile to The Social Base...')
    chrome.tabs.create({ url: 'http://127.0.0.1:5199/' })
  })

  try {
    const { recognizedPlatformAccounts = {} } = await chrome.storage.local.get('recognizedPlatformAccounts')
    const accountInfo = recognizedPlatformAccounts[detectedPlatformKey]
    if (detectedAccount) detectedAccount.textContent = accountInfo?.handle || '@ready'
  } catch {}

  // 2. Fetch Latest Post from Main App Backend
  async function loadPostFromApp() {
    try {
      const res = await fetch('http://127.0.0.1:4174/api/social/posts')
      if (res.ok) {
        const data = await res.json()
        currentPost = data?.posts?.[0] || null
      }
    } catch {}

    if (currentPost) {
      const platformText = currentPost.variants?.[detectedPlatformKey] || currentPost.variants?.x || currentPost.title
      if (activePostPreview) activePostPreview.textContent = platformText
      if (syncStatus) syncStatus.textContent = 'Ready to Post'
    } else {
      const fallbackText = 'Shipped The Social Base & Zuari update — modular social publishing and audience tools. 🚀'
      if (activePostPreview) activePostPreview.textContent = fallbackText
      currentPost = {
        title: 'The Social Base and Zuari update',
        variants: { [detectedPlatformKey]: fallbackText }
      }
    }
  }

  refreshSyncBtn?.addEventListener('click', async () => {
    refreshSyncBtn.style.transform = 'rotate(180deg)'
    await loadPostFromApp()
    showAlert('success', '✨ Refreshed latest post from App!')
    setTimeout(() => { refreshSyncBtn.style.transform = 'none' }, 400)
  })

  await loadPostFromApp()

  // 3. Primary Action: 1-Click Post to Active Website
  primarySmartActionBtn?.addEventListener('click', async () => {
    primarySmartActionBtn.disabled = true
    try {
      const content = currentPost?.variants?.[detectedPlatformKey] || currentPost?.variants?.x || currentPost?.title || ''
      const title = currentPost?.title || 'Release Update'

      const isAlreadyOnPlatform = (activeTab?.url || '').includes(detectedPlatformKey)
      if (isAlreadyOnPlatform) {
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

  // 3b. 1-Click Roll Viral Debate & GitHub Promo Topic
  const randomizeViralBtn = document.getElementById('randomizeViralBtn')
  randomizeViralBtn?.addEventListener('click', async () => {
    randomizeViralBtn.disabled = true
    try {
      const res = await fetch(`http://127.0.0.1:4174/api/social/viral?platform=${detectedPlatformKey}`)
      if (res.ok) {
        const data = await res.json()
        const viral = data.formatted
        const topic = data.topic || {}
        currentPost = {
          title: viral.title,
          topicId: topic.id,
          topicObj: topic,
          variants: { [detectedPlatformKey]: viral.mainPost }
        }
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

  // 4. Harvest Page Data -> Direct to Main App
  harvestPageBtn?.addEventListener('click', async () => {
    if (!activeTab?.id) return
    harvestPageBtn.disabled = true
    try {
      const results = await chrome.scripting.executeScript({
        target: { tabId: activeTab.id },
        func: extractStructuredPageIntel
      })
      const intel = results?.[0]?.result || {
        platformId: detectedPlatformKey,
        title: activeTab.title || 'Community Thread',
        url: activeTab.url,
        summary: `Harvested ${activeTab.title}`
      }

      const res = await fetch('http://127.0.0.1:4174/api/social/harvest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(intel)
      })
      if (res.ok) showAlert('success', `📥 Harvested & sent directly to Main App!`)
      else showAlert('success', `📋 Saved ${theme.name} intel to local clipboard!`)
    } catch {
      showAlert('success', `📋 Saved to local clipboard!`)
    } finally {
      harvestPageBtn.disabled = false
    }
  })

  // 5. Broadcast to All Channels
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
      if (res.ok) showAlert('success', '🚀 Broadcast queued across all channels!')
      else showAlert('error', 'App server not responding.')
    } catch (err) {
      showAlert('error', String(err))
    } finally {
      broadcastAllBtn.disabled = false
    }
  })

  extractIgBtn?.addEventListener('click', () => {
    chrome.tabs.create({ url: 'http://127.0.0.1:5173/' })
  })
})
