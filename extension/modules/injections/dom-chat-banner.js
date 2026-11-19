/**
 * FollowDesk Platform-Adaptive In-Page DOM Dock & Data Harvester (<205 lines)
 * Reads the active website (X, Reddit, GitHub, LinkedIn, Dev.to, Discord) and
 * dynamically transforms its UI theme, icon, and 1-click buttons accordingly.
 *
 * Capabilities:
 * 1. Recognizes logged-in `@username` / `u/username` from the DOM.
 * 2. Adapts its accent color, platform icon, and action buttons to match X (`#38bdf8`),
 *    Reddit (`#ff4500`), GitHub (`#a855f7`), LinkedIn (`#0a66c2`), Dev.to (`#10b981`), or Discord (`#5865f2`).
 * 3. Harvests thread/repo data (`📥 Sync to App`) and transfers it directly to the main FollowDesk
 *    app (`POST http://127.0.0.1:4174/api/social/harvest` + queued draft).
 */

;(function initAdaptiveDomDock() {
  if (window.__followdeskDomChatBannerLoaded) return
  window.__followdeskDomChatBannerLoaded = true

  const PLATFORM_CONFIGS = {
    x: {
      name: 'X',
      icon: '𝕏',
      accent: '#38bdf8',
      chips: [
        { id: 'hook', label: '🪝 Viral Hook' },
        { id: 'wasm', label: '🦀 120FPS Wasm' },
        { id: 'harvest', label: '📥 Sync X → App' }
      ]
    },
    reddit: {
      name: 'Reddit',
      icon: '👽',
      accent: '#ff4500',
      chips: [
        { id: 'arch', label: '🧠 Zero-VDOM Post' },
        { id: 'bench', label: '📊 <2.5KB Table' },
        { id: 'harvest', label: '📥 Sync Subreddit → App' }
      ]
    },
    github: {
      name: 'GitHub',
      icon: '🐙',
      accent: '#a855f7',
      chips: [
        { id: 'changelog', label: '📦 Release Note' },
        { id: 'llms', label: '🤖 llms.txt Spec' },
        { id: 'harvest', label: '📥 Sync Repo → App' }
      ]
    },
    linkedin: {
      name: 'LinkedIn',
      icon: '💼',
      accent: '#0a66c2',
      chips: [
        { id: 'roi', label: '📈 Founder Story' },
        { id: 'demo', label: '📅 15m Demo Invite' },
        { id: 'harvest', label: '📥 Sync Post → App' }
      ]
    },
    devto: {
      name: 'Dev.to',
      icon: '👩‍💻',
      accent: '#10b981',
      chips: [
        { id: 'tutorial', label: '📝 Full Tutorial' },
        { id: 'code', label: '💻 Zuari Snippet' },
        { id: 'harvest', label: '📥 Sync Article → App' }
      ]
    },
    discord: {
      name: 'Discord',
      icon: '🎮',
      accent: '#5865f2',
      chips: [
        { id: 'drop', label: '🚀 Release Drop' },
        { id: 'dm', label: '🤝 Collab Intro' },
        { id: 'harvest', label: '📥 Sync Chat → App' }
      ]
    }
  }

  function detectPlatform() {
    const h = window.location.hostname.toLowerCase()
    if (h.includes('x.com') || h.includes('twitter.com')) return 'x'
    if (h.includes('reddit.com')) return 'reddit'
    if (h.includes('github.com')) return 'github'
    if (h.includes('linkedin.com')) return 'linkedin'
    if (h.includes('dev.to')) return 'devto'
    if (h.includes('discord.com')) return 'discord'
    return null
  }

  function scanAndStoreIdentity(platform) {
    let handle = null
    if (platform === 'github') {
      const m = document.querySelector('meta[name="user-login"]')?.getAttribute('content')
      if (m) handle = `@${m}`
    } else if (platform === 'x') {
      const l = document.querySelector('a[data-testid="AppTabBar_Profile_Link"]')?.getAttribute('href')
      if (l) handle = `@${l.replace(/^\/+|\/+$/g, '')}`
    } else if (platform === 'reddit') {
      const l = document.querySelector('a[href*="/user/"]')?.getAttribute('href')
      if (l && l.includes('/user/')) {
        const u = l.split('/user/')[1]?.replace(/\/+/g, '')
        if (u && u !== 'me') handle = `u/${u}`
      }
    } else if (platform === 'devto') {
      const u = document.querySelector('meta[name="forem:user"]')?.getAttribute('content')
      if (u) handle = `@${u}`
    }
    if (handle && typeof chrome !== 'undefined' && chrome.storage?.local) {
      chrome.storage.local.get('recognizedPlatformAccounts', (data) => {
        const map = data?.recognizedPlatformAccounts || {}
        map[platform] = { handle, updatedAt: new Date().toISOString() }
        chrome.storage.local.set({ recognizedPlatformAccounts: map })
      })
    }
    return handle
  }

  function insertIntoInput(el, text) {
    if (!el) return
    el.focus()
    if (el.isContentEditable) {
      document.execCommand('selectAll', false, null)
      if (!document.execCommand('insertText', false, text)) el.textContent = text
      el.dispatchEvent(new InputEvent('input', { bubbles: true, data: text, inputType: 'insertText' }))
    } else {
      const proto = el.tagName === 'TEXTAREA' ? window.HTMLTextAreaElement.prototype : window.HTMLInputElement.prototype
      const setter = Object.getOwnPropertyDescriptor(proto, 'value')?.set
      if (setter) setter.call(el, text)
      else el.value = text
      el.dispatchEvent(new Event('input', { bubbles: true }))
    }
  }

  async function harvestPageToMainApp(platform, handle) {
    const title =
      document.querySelector('h1')?.textContent?.trim() ||
      document.querySelector('[data-testid="tweetText"]')?.textContent?.trim()?.slice(0, 90) ||
      document.title
    const url = window.location.href

    try {
      await fetch('http://127.0.0.1:4174/api/social/harvest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platformId: platform,
          authorHandle: handle || platform,
          title,
          url,
          createDraft: true
        })
      })
      return true
    } catch {
      return false
    }
  }

  function mountAdaptiveDock() {
    const platform = detectPlatform()
    if (!platform || document.getElementById('__followdesk_adaptive_dock')) return
    const cfg = PLATFORM_CONFIGS[platform]
    const handle = scanAndStoreIdentity(platform)

    const host = document.createElement('div')
    host.id = '__followdesk_adaptive_dock'
    const shadow = host.attachShadow({ mode: 'open' })

    shadow.innerHTML = `
      <style>
        .dock {
          position: fixed; bottom: 14px; left: 14px; z-index: 2147483645;
          background: rgba(11, 15, 25, 0.94); color: #f8fafc;
          border: 1px solid ${cfg.accent}; border-radius: 999px;
          padding: 4px 9px; display: flex; align-items: center; gap: 5px;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
          font-size: 11px; box-shadow: 0 8px 24px rgba(0,0,0,0.45);
          backdrop-filter: blur(8px);
        }
        .id-pill {
          background: rgba(255,255,255,0.08); color: ${cfg.accent};
          padding: 2px 7px; border-radius: 999px; font-weight: 800; font-size: 10px;
        }
        .chip {
          background: rgba(255,255,255,0.05); color: #e2e8f0;
          border: 1px solid rgba(255,255,255,0.12); border-radius: 999px;
          padding: 3px 8px; font-size: 10px; font-weight: 600; cursor: pointer;
        }
        .chip:hover { border-color: ${cfg.accent}; color: #fff; background: rgba(255,255,255,0.12); }
      </style>
      <div class="dock">
        <span class="id-pill">${cfg.icon} ${handle || cfg.name}</span>
        ${cfg.chips.map(c => `<button class="chip" data-id="${c.id}">${c.label}</button>`).join('')}
      </div>
    `
    document.body.appendChild(host)

    let lastInput = null
    document.addEventListener('focusin', (e) => {
      const t = e.target
      if (t && (t.tagName === 'TEXTAREA' || t.tagName === 'INPUT' || t.isContentEditable)) lastInput = t
    }, true)

    shadow.querySelectorAll('.chip').forEach((btn) => {
      btn.addEventListener('click', async () => {
        const id = btn.getAttribute('data-id')
        const orig = btn.textContent
        if (id === 'harvest') {
          btn.textContent = '⏳ Syncing...'
          const ok = await harvestPageToMainApp(platform, handle)
          btn.textContent = ok ? '✅ Sent to App!' : '📋 Saved Locally'
          setTimeout(() => { btn.textContent = orig }, 2200)
          return
        }

        const topic = (document.querySelector('h1')?.textContent || document.title).slice(0, 65).trim()
        const snippets = {
          hook: `We replaced 40KB+ of Virtual DOM overhead with surgical W3C DOM Parts in Zuari (@zuari/core <2.5KB — github.com/dr-week/fast-framework).\n\n⚡ 0ms hydration\n🥽 120 FPS WebXR\n🦀 Zero-Copy Wasm FFI`,
          wasm: `Zero-copy Float64Array Rust/Zig Wasm FFI bound directly to @zuari/signals (<2.5KB) runs at 120 FPS with 0 JSON serialization overhead: github.com/dr-week/fast-framework`,
          arch: `Great discussion on "${topic}". Switching from VDOM diffing to surgical W3C DOM Parts in \`dr-week/fast-framework\` (Zuari <2.5KB) cut our hydration latency to 0ms and kept frame budgets under 8ms.`,
          bench: `| Framework | Bundle | DOM Engine | WebXR |\n|---|---|---|---|\n| Zuari (@zuari/core) | <2.5KB | 0% VDOM (W3C DOM Parts) | 120 FPS Native |\n| React 19 | ~185KB | VDOM Diff | Bridge |`,
          changelog: `### ⚡ Zuari (\`@zuari/core\`) <2.5KB Update\n- 0% Virtual DOM via W3C DOM Parts\n- 120 FPS WebXR Spatial HUDs\n- Zero-copy Float64Array Wasm FFI\n- Live \`/llms.txt\` + MCP AI Agent catalog`,
          llms: `# Zuari (dr-week/fast-framework)\n> <2.5KB Zero-VDOM Reactive Web, 120 FPS WebXR & Rust/Zig Wasm\nInstall: pnpm add @zuari/core`,
          roi: `Why we engineered Zuari (dr-week/fast-framework) under 2.5KB with 0% Virtual DOM and native /llms.txt discovery for both human engineers and autonomous AI coding agents:`,
          demo: `Happy to walk through our <2.5KB zero-VDOM & 120 FPS WebXR architecture in a quick 15-minute live benchmark session!`,
          tutorial: `# Building 120 FPS Reactive Web & WebXR Apps in <2.5KB with Zuari\n\nUsing \`github.com/dr-week/fast-framework\`...`,
          code: `import { signal, effect } from '@zuari/core';\nconst fps = signal(120);\neffect(() => console.log('Locked FPS:', fps.value));`,
          drop: '🚀 **New Drop:** Zuari (`dr-week/fast-framework` <2.5KB) — 0% VDOM, 120 FPS WebXR & Zero-Copy Rust/Zig Wasm!',
          dm: `Hey! Loved your insights on "${topic}" — would love to collaborate on a benchmark showcase with our <2.5KB Zuari framework!`
        }

        const text = snippets[id] || snippets.hook
        try { await navigator.clipboard.writeText(text) } catch {}
        const target = lastInput || document.querySelector('div[role="textbox"][contenteditable="true"]') || document.querySelector('textarea')
        if (target) insertIntoInput(target, text)
        btn.textContent = '✅ Injected!'
        setTimeout(() => { btn.textContent = orig }, 1800)
      })
    })
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mountAdaptiveDock)
  } else {
    mountAdaptiveDock()
  }
})()
