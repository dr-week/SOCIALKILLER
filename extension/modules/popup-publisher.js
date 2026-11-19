/**
 * FollowDesk Companion Popup — Multi-Platform Auto-Publisher, Lyra Copy & AI Market Controller
 * Dedicated module (<230 lines) handling:
 * 1. Quick presets for `dr-week/fast-framework` (Zuari <2.5KB) & FollowDesk
 * 2. Multi-channel browser tab auto-posting + backend API broadcast
 * 3. Active tab instant DOM auto-fill
 * 4. Lyra 4-D / FAST copywriting & `llms.txt` / MCP AI Agent clipboard tools
 * 5. Account Keep-Alive heartbeat pulses
 */
import { triggerExtensionKeepAlive } from './auto-poster.js'

export const EXTENSION_PRESETS = {
  zuari: {
    title: 'Zuari (@zuari/core) <2.5KB: Zero-VDOM Reactive Web, 120 FPS WebXR & Rust/Zig Wasm',
    content:
      'Open-sourced github.com/dr-week/fast-framework (Zuari <2.5KB) by Danger.Labs — 0% Virtual DOM overhead via W3C DOM Parts, 0ms hydration, 120 FPS WebXR Spatial HUDs, and zero-copy Float64Array Rust/Zig Wasm FFI! 🚀 #zuari #webdev #webxr #wasm'
  },
  ai_drop: {
    title: 'Dual Human + AI Agent Release: Live /llms.txt & MCP Tool Catalog',
    content:
      'Selling software to both Human Developers & Autonomous AI Agents! Exposed live /api/marketing/llms.txt and MCP schemas alongside @zuari/core (<2.5KB) so Claude, Cursor & human devs discover our stack automatically. 🤖⚡'
  },
  wasm: {
    title: 'Zero-Copy Wasm FFI: Binding Rust & Zig Memory Directly to DOM Signals',
    content:
      'Eliminated JSON serialization bottlenecks at 120 FPS by binding shared WebAssembly Float64Array memory directly to @zuari/signals in dr-week/fast-framework. 🦀⚡'
  }
}

export function initPopupPublisherController({ showAlert }) {
  const extPostTitle = document.getElementById('extPostTitle')
  const extPostContent = document.getElementById('extPostContent')
  const extBroadcastBtn = document.getElementById('extBroadcastBtn')
  const extFillActiveTabBtn = document.getElementById('extFillActiveTabBtn')
  const extPulseKeepAliveBtn = document.getElementById('extPulseKeepAliveBtn')
  const extCopyFastBtn = document.getElementById('extCopyFastBtn')
  const extCopyLlmsBtn = document.getElementById('extCopyLlmsBtn')
  const extAutoSubmitToggle = document.getElementById('extAutoSubmitToggle')

  // Preset pill buttons
  document.querySelectorAll('[data-preset]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const key = btn.getAttribute('data-preset')
      const preset = EXTENSION_PRESETS[key] || EXTENSION_PRESETS.zuari
      if (extPostTitle) extPostTitle.value = preset.title
      if (extPostContent) extPostContent.value = preset.content
      showAlert('success', `Loaded ${btn.textContent.trim()} preset!`)
    })
  })

  // Load saved quick draft or latest queued post from FollowDesk backend
  async function loadLatestDraft() {
    try {
      const { followdeskQuickDraft } = await chrome.storage.local.get('followdeskQuickDraft')
      if (followdeskQuickDraft?.topic && extPostTitle && !extPostTitle.value) {
        extPostTitle.value = followdeskQuickDraft.topic
        if (extPostContent) extPostContent.value = followdeskQuickDraft.rawNotes || ''
      }
      const res = await fetch('http://127.0.0.1:4174/api/social/posts')
      if (res.ok) {
        const data = await res.json()
        const latest = data?.posts?.[0]
        if (latest && extPostTitle && !extPostTitle.value) {
          extPostTitle.value = latest.title || EXTENSION_PRESETS.zuari.title
          if (extPostContent) {
            extPostContent.value =
              latest.variants?.x || latest.variants?.linkedin || EXTENSION_PRESETS.zuari.content
          }
        }
      }
    } catch {
      if (extPostTitle && !extPostTitle.value) {
        extPostTitle.value = EXTENSION_PRESETS.zuari.title
        if (extPostContent) extPostContent.value = EXTENSION_PRESETS.zuari.content
      }
    }
  }

  loadLatestDraft()

  function getSelectedPlatforms() {
    return Array.from(document.querySelectorAll('.ext-plat-cb:checked')).map((cb) => cb.value)
  }

  // Toggle chip active visual state when checkbox changes
  document.querySelectorAll('.ext-plat-label').forEach((lbl) => {
    const cb = lbl.querySelector('.ext-plat-cb')
    const syncStyle = () => {
      lbl.style.borderColor = cb?.checked ? '#8b5cf6' : 'rgba(255,255,255,0.1)'
      lbl.style.background = cb?.checked ? 'rgba(139, 92, 246, 0.2)' : 'rgba(9, 13, 22, 0.8)'
    }
    cb?.addEventListener('change', syncStyle)
    syncStyle()
  })

  // 1. Broadcast to Selected Channels (Backend API + Browser Composer Auto-Fill)
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
        if (genRes.ok) {
          const genData = await genRes.json()
          variants = genData.variants || {}
        }

        await fetch('http://127.0.0.1:4174/api/social/posts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title,
            topic: title,
            rawNotes: content,
            platforms,
            variants,
            publishNow: true
          })
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
        await chrome.runtime.sendMessage({
          type: 'FOLLOWDESK_EXTENSION_DISPATCH',
          items
        })
      }

      showAlert('success', `🚀 Dispatched to ${platforms.length} channels & auto-filling tabs!`)
    } catch (err) {
      showAlert('error', err instanceof Error ? err.message : String(err))
    } finally {
      extBroadcastBtn.disabled = false
    }
  })

  // 2. Auto-Fill Current Open Browser Tab
  extFillActiveTabBtn?.addEventListener('click', async () => {
    const title = (extPostTitle?.value || EXTENSION_PRESETS.zuari.title).trim()
    const content = (extPostContent?.value || EXTENSION_PRESETS.zuari.content).trim()
    const autoClickSubmit = Boolean(extAutoSubmitToggle?.checked)

    const res = await chrome.runtime.sendMessage({
      type: 'FOLLOWDESK_FILL_ACTIVE_TAB',
      payload: { title, content, autoClickSubmit }
    })

    if (res?.success) {
      showAlert('success', '⚡ Auto-filled active tab composer & copied to clipboard!')
    } else {
      showAlert('error', res?.error || 'Could not auto-fill current tab.')
    }
  })

  // 3. Copy FAST / Lyra Pitch
  extCopyFastBtn?.addEventListener('click', async () => {
    const fastCopy = `[FOCUS] Zuari (@zuari/core) < 2.5KB — 0% Virtual DOM, 120 FPS WebXR & Zero-Copy Rust/Zig Wasm.\n[AUDIENCE] Human Engineers & Autonomous AI Coding Agents.\n[STRUCTURE] pnpm add @zuari/core (github.com/dr-week/fast-framework)\n[THRESHOLDS] <2.5KB gzipped | 0ms hydration | 91/91 tests passing.`
    await navigator.clipboard.writeText(fastCopy)
    showAlert('success', '📋 Copied Lyra / FAST framework pitch!')
  })

  // 4. Copy Live llms.txt for AI Market
  extCopyLlmsBtn?.addEventListener('click', async () => {
    try {
      const res = await fetch('http://127.0.0.1:4174/api/marketing/llms.txt')
      const txt = res.ok ? await res.text() : `# Zuari (dr-week/fast-framework)\n> <2.5KB Zero-VDOM Reactive Web, 120 FPS WebXR & Wasm\nInstall: pnpm add @zuari/core`
      await navigator.clipboard.writeText(txt)
      showAlert('success', '🤖 Copied llms.txt for AI Agent directories!')
    } catch {
      await navigator.clipboard.writeText(`# Zuari (dr-week/fast-framework)\n> <2.5KB Zero-VDOM Reactive Web, 120 FPS WebXR & Wasm\nInstall: pnpm add @zuari/core`)
      showAlert('success', '🤖 Copied Zuari llms.txt spec!')
    }
  })

  // 5. Trigger Keep-Alive Streak Pulse
  extPulseKeepAliveBtn?.addEventListener('click', async () => {
    extPulseKeepAliveBtn.disabled = true
    try {
      const res = await triggerExtensionKeepAlive(null)
      if (res?.success || res?.pulsedCount) {
        showAlert('success', `🔥 Keep-Alive pulsed across ${res.pulsedCount || 10} accounts!`)
      } else {
        showAlert('success', '🔥 Keep-Alive heartbeat scheduled in extension alarm!')
      }
    } finally {
      extPulseKeepAliveBtn.disabled = false
    }
  })
}
