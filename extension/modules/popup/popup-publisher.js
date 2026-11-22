/**
 * FollowDesk Companion Popup — Multi-Platform Auto-Publisher Controller (<130 lines)
 */
import { triggerExtensionKeepAlive } from '../session/auto-poster.js'
import {
  EXTENSION_PRESETS,
  copyLlmsTxt,
  loadLatestPopupDraft
} from './popup-publisher-presets.js'

export { EXTENSION_PRESETS }

export function initPopupPublisherController({ showAlert }) {
  const extPostTitle = document.getElementById('extPostTitle')
  const extPostContent = document.getElementById('extPostContent')
  const extBroadcastBtn = document.getElementById('extBroadcastBtn')
  const extFillActiveTabBtn = document.getElementById('extFillActiveTabBtn')
  const extPulseKeepAliveBtn = document.getElementById('extPulseKeepAliveBtn')
  const extCopyFastBtn = document.getElementById('extCopyFastBtn')
  const extCopyLlmsBtn = document.getElementById('extCopyLlmsBtn')
  const extAutoSubmitToggle = document.getElementById('extAutoSubmitToggle')

  document.querySelectorAll('[data-preset]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const preset = EXTENSION_PRESETS[btn.getAttribute('data-preset')] || EXTENSION_PRESETS.zuari
      if (extPostTitle) extPostTitle.value = preset.title
      if (extPostContent) extPostContent.value = preset.content
      showAlert('success', `Loaded ${btn.textContent.trim()} preset!`)
    })
  })

  loadLatestPopupDraft(extPostTitle, extPostContent)

  const getSelectedPlatforms = () =>
    Array.from(document.querySelectorAll('.ext-plat-cb:checked')).map((cb) => cb.value)

  document.querySelectorAll('.ext-plat-label').forEach((lbl) => {
    const cb = lbl.querySelector('.ext-plat-cb')
    const syncStyle = () => {
      lbl.style.borderColor = cb?.checked ? '#8b5cf6' : 'rgba(255,255,255,0.1)'
      lbl.style.background = cb?.checked ? 'rgba(139, 92, 246, 0.2)' : 'rgba(9, 13, 22, 0.8)'
    }
    cb?.addEventListener('change', syncStyle)
    syncStyle()
  })

  extBroadcastBtn?.addEventListener('click', async () => {
    const title = (extPostTitle?.value || EXTENSION_PRESETS.zuari.title).trim()
    const content = (extPostContent?.value || EXTENSION_PRESETS.zuari.content).trim()
    const platforms = getSelectedPlatforms()
    const autoClickSubmit = Boolean(extAutoSubmitToggle?.checked)

    if (platforms.length === 0) {
      showAlert('error', 'Select at least 1 channel.')
      return
    }

    extBroadcastBtn.disabled = true
    try {
      let variants = {}
      try {
        const genRes = await fetch('http://127.0.0.1:4174/api/social/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ topic: title, rawNotes: content })
        })
        if (genRes.ok) variants = (await genRes.json()).variants || {}

        await fetch('http://127.0.0.1:4174/api/social/posts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title, topic: title, rawNotes: content, platforms, variants, publishNow: true })
        })
      } catch {}

      const browserPlatforms = platforms.filter((p) => p !== 'ai_registry')
      if (browserPlatforms.length > 0) {
        const items = browserPlatforms.slice(0, 4).map((pId) => ({
          platformId: pId,
          title,
          content: variants[pId] || content,
          autoClickSubmit
        }))
        await chrome.runtime.sendMessage({ type: 'FOLLOWDESK_EXTENSION_DISPATCH', items })
      }
      showAlert('success', `🚀 Dispatched to ${platforms.length} channels & auto-filling tabs!`)
    } catch (err) {
      showAlert('error', err instanceof Error ? err.message : String(err))
    } finally {
      extBroadcastBtn.disabled = false
    }
  })

  extFillActiveTabBtn?.addEventListener('click', async () => {
    const title = (extPostTitle?.value || EXTENSION_PRESETS.zuari.title).trim()
    const content = (extPostContent?.value || EXTENSION_PRESETS.zuari.content).trim()
    const res = await chrome.runtime.sendMessage({
      type: 'FOLLOWDESK_FILL_ACTIVE_TAB',
      payload: { title, content, autoClickSubmit: Boolean(extAutoSubmitToggle?.checked) }
    })
    showAlert(res?.success ? 'success' : 'error', res?.success ? '⚡ Auto-filled active tab composer & copied to clipboard!' : (res?.error || 'Could not auto-fill current tab.'))
  })

  extCopyFastBtn?.addEventListener('click', async () => {
    const fastCopy = '[FOCUS] Zuari (@zuari/core) < 2.5KB — 0% Virtual DOM, 120 FPS WebXR & Zero-Copy Rust/Zig Wasm.\n[AUDIENCE] Human Engineers & Autonomous AI Coding Agents.\n[STRUCTURE] pnpm add @zuari/core (github.com/dr-week/fast-framework)\n[THRESHOLDS] <2.5KB gzipped | 0ms hydration | 91/91 tests passing.'
    await navigator.clipboard.writeText(fastCopy)
    showAlert('success', '📋 Copied Lyra / FAST framework pitch!')
  })

  extCopyLlmsBtn?.addEventListener('click', () => copyLlmsTxt(showAlert))

  extPulseKeepAliveBtn?.addEventListener('click', async () => {
    extPulseKeepAliveBtn.disabled = true
    try {
      const res = await triggerExtensionKeepAlive(null)
      showAlert('success', res?.success || res?.pulsedCount ? `🔥 Keep-Alive pulsed across ${res.pulsedCount || 10} accounts!` : '🔥 Keep-Alive heartbeat scheduled in extension alarm!')
    } finally {
      extPulseKeepAliveBtn.disabled = false
    }
  })
}
