;(function initFoundryDeskInteractionRecorder() {
  if (window.__foundryDeskRecorderReady) return
  window.__foundryDeskRecorderReady = true

  const MAX_STEPS = 100
  const SAFE_ATTRIBUTE = /^[\w .:-]{1,80}$/
  const UNSAFE_ACTION = /\b(post|publish|submit|send|reply|comment|like|follow|unfollow|delete|remove|purchase|buy|pay|share|connect|invite)\b/i
  let recording = false
  let steps = []
  let lastScrollY = window.scrollY
  let scrollDelta = 0
  let scrollTimer = 0

  function selectorFor(element) {
    const tag = element.tagName.toLowerCase()
    for (const attr of ['data-testid', 'aria-label', 'name', 'id', 'placeholder']) {
      const value = element.getAttribute(attr)?.trim()
      if (value && SAFE_ATTRIBUTE.test(value)) return `${tag}[${attr}="${value}"]`
    }
    return ''
  }

  function isSensitiveField(element) {
    const type = (element.getAttribute('type') || '').toLowerCase()
    const autocomplete = (element.getAttribute('autocomplete') || '').toLowerCase()
    return ['password', 'email', 'tel', 'hidden', 'number'].includes(type) || /password|one-time-code|cc-|address|email|tel/.test(autocomplete)
  }

  function stepLabel(element) {
    return ['aria-label', 'placeholder', 'name', 'data-testid'].map(name => element.getAttribute(name)?.trim()).find(value => value && SAFE_ATTRIBUTE.test(value)) || element.tagName.toLowerCase()
  }

  function push(step) {
    if (steps.length < MAX_STEPS) steps.push({ id: `${steps.length + 1}`, ...step })
  }

  function onClick(event) {
    if (!recording || !(event.target instanceof Element)) return
    const button = event.target.closest('button,[role="button"]')
    if (!button) return
    const label = `${button.getAttribute('aria-label') || ''} ${button.getAttribute('title') || ''} ${button.innerText || ''}`.trim()
    const selector = selectorFor(button)
    if (!selector || button.tagName === 'A' || button.closest('form') || button.getAttribute('type') === 'submit' || UNSAFE_ACTION.test(label)) return
    push({ action: 'click', selector, label: stepLabel(button) })
  }

  function onInput(event) {
    if (!recording || !(event.target instanceof Element)) return
    const field = event.target
    if (!(field instanceof HTMLInputElement || field instanceof HTMLTextAreaElement || field.isContentEditable) || isSensitiveField(field)) return
    const selector = selectorFor(field)
    if (!selector) return
    if (steps.at(-1)?.action === 'fill' && steps.at(-1)?.selector === selector) return
    push({ action: 'fill', selector, label: stepLabel(field), value: '' })
  }

  function onScroll() {
    if (!recording) return
    const y = window.scrollY
    scrollDelta += y - lastScrollY
    lastScrollY = y
    clearTimeout(scrollTimer)
    scrollTimer = setTimeout(() => {
      if (scrollDelta) push({ action: 'scroll', deltaY: Math.max(-2000, Math.min(2000, Math.round(scrollDelta))) })
      scrollDelta = 0
    }, 450)
  }

  function startRecording() {
    steps = []
    lastScrollY = window.scrollY
    scrollDelta = 0
    recording = true
    document.addEventListener('click', onClick, true)
    document.addEventListener('input', onInput, true)
    window.addEventListener('scroll', onScroll, { passive: true })
    return { success: true, origin: location.origin }
  }

  function stopRecording() {
    recording = false
    document.removeEventListener('click', onClick, true)
    document.removeEventListener('input', onInput, true)
    window.removeEventListener('scroll', onScroll)
    clearTimeout(scrollTimer)
    if (scrollDelta) push({ action: 'scroll', deltaY: Math.max(-2000, Math.min(2000, Math.round(scrollDelta))) })
    scrollDelta = 0
    return { success: true, origin: location.origin, steps: steps.slice() }
  }

  function safeClickTarget(element) {
    if (!(element instanceof HTMLElement) || element.closest('form') || element.closest('a')) return false
    if (element.getAttribute('type') === 'submit') return false
    const label = `${element.getAttribute('aria-label') || ''} ${element.getAttribute('title') || ''} ${element.innerText || ''}`
    return !UNSAFE_ACTION.test(label)
  }

  async function replay(workflow) {
    if (!workflow || workflow.origin !== location.origin || !Array.isArray(workflow.steps) || workflow.steps.length > MAX_STEPS) {
      return { success: false, error: 'Workflow site does not match this page.' }
    }
    const results = []
    for (const [index, step] of workflow.steps.entries()) {
      try {
        if (step.action === 'wait') {
          await new Promise(resolve => setTimeout(resolve, Math.min(5000, Math.max(0, Number(step.durationMs) || 0))))
        } else if (step.action === 'scroll') {
          const amount = Number(step.deltaY)
          if (!Number.isFinite(amount) || Math.abs(amount) > 2000) throw new Error('Invalid scroll distance.')
          window.scrollBy({ top: amount, behavior: 'smooth' })
        } else {
          const target = document.querySelector(step.selector)
          if (!target) throw new Error('Target is not on this page.')
          if (step.action === 'click') {
            if (!safeClickTarget(target)) throw new Error('This control is not replayable.')
            target.click()
          } else if (step.action === 'fill') {
            if (!(target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement || target.isContentEditable) || isSensitiveField(target)) throw new Error('This field is not replayable.')
            if (!String(step.value || '').trim()) throw new Error('Add reviewed text in The Social Base before replaying this field.')
            target.focus()
            if (target.isContentEditable) target.textContent = step.value
            else {
              const prototype = target instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype
              Object.getOwnPropertyDescriptor(prototype, 'value')?.set?.call(target, step.value)
            }
            target.dispatchEvent(new InputEvent('input', { bubbles: true, inputType: 'insertText', data: step.value }))
            target.dispatchEvent(new Event('change', { bubbles: true }))
          } else throw new Error('Unsupported step.')
          await new Promise(resolve => setTimeout(resolve, 250))
        }
        results.push({ index: index + 1, success: true })
      } catch (error) {
        results.push({ index: index + 1, success: false, error: error.message })
        break
      }
    }
    return { success: results.every(result => result.success), results }
  }

  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message?.type === 'FOUNDRYDESK_WORKFLOW_START_RECORDING') sendResponse(startRecording())
    else if (message?.type === 'FOUNDRYDESK_WORKFLOW_STOP_RECORDING') sendResponse(stopRecording())
    else if (message?.type === 'FOUNDRYDESK_WORKFLOW_REPLAY') replay(message.workflow).then(sendResponse)
    else if (message?.type === 'FOUNDRYDESK_WORKFLOW_RECORDING_STATUS') sendResponse({ recording })
    else return false
    return message.type === 'FOUNDRYDESK_WORKFLOW_REPLAY'
  })
})()
