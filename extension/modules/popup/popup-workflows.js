/**
 * Popup Interaction Workflow Recorder & Replay Controller (<135 lines)
 */
export function initPopupWorkflows({ getActiveTab }) {
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
    await chrome.scripting.executeScript({ target: { tabId }, files: ['modules/session/interaction-recorder.js'] })
  }

  async function loadInteractionWorkflows() {
    try {
      const activeTab = getActiveTab()
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
    const activeTab = getActiveTab()
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
    const activeTab = getActiveTab()
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
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(draft)
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
    const activeTab = getActiveTab()
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
      setWorkflowStatus(failed ? `Stopped at step ${failed.index}: ${failed.error}` : `Completed ${done} reviewed steps.`, Boolean(failed))
    } catch (error) {
      setWorkflowStatus(error.message || 'Could not replay workflow.', true)
    } finally { workflowReplay.disabled = false }
  })

  workflowList?.addEventListener('change', () => { workflowReplay.disabled = !workflowList.value })

  return { loadInteractionWorkflows }
}
