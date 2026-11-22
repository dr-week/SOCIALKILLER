/**
 * FollowDesk Platform-Adaptive In-Page DOM Dock & Data Harvester (<135 lines)
 */
;(function initAdaptiveDomDock() {
  if (window.__followdeskDomChatBannerLoaded) return
  window.__followdeskDomChatBannerLoaded = true

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
    try {
      await fetch('http://127.0.0.1:4174/api/social/harvest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ platformId: platform, authorHandle: handle || platform, title, url: window.location.href, createDraft: true })
      })
      return true
    } catch {
      return false
    }
  }

  function mountAdaptiveDock() {
    const platform = detectPlatform()
    const bannerConfig = window.__followdeskBannerConfig
    if (!platform || !bannerConfig || document.getElementById('__followdesk_adaptive_dock')) return
    const cfg = bannerConfig.platforms[platform]
    if (!cfg) return
    const handle = scanAndStoreIdentity(platform)

    const host = document.createElement('div')
    host.id = '__followdesk_adaptive_dock'
    const shadow = host.attachShadow({ mode: 'open' })
    shadow.innerHTML = `
      <style>
        .dock{position:fixed;bottom:14px;left:14px;z-index:2147483645;background:rgba(11,15,25,0.94);color:#f8fafc;border:1px solid ${cfg.accent};border-radius:999px;padding:4px 9px;display:flex;align-items:center;gap:5px;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;font-size:11px;box-shadow:0 8px 24px rgba(0,0,0,0.45);backdrop-filter:blur(8px)}
        .id-pill{background:rgba(255,255,255,0.08);color:${cfg.accent};padding:2px 7px;border-radius:999px;font-weight:800;font-size:10px}
        .chip{background:rgba(255,255,255,0.05);color:#e2e8f0;border:1px solid rgba(255,255,255,0.12);border-radius:999px;padding:3px 8px;font-size:10px;font-weight:600;cursor:pointer}
        .chip:hover{border-color:${cfg.accent};color:#fff;background:rgba(255,255,255,0.12)}
      </style>
      <div class="dock">
        <span class="id-pill">${cfg.icon} ${handle || cfg.name}</span>
        ${cfg.chips.map(c => `<button class="chip" data-id="${c.id}">${c.label}</button>`).join('')}
      </div>`
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
        const text = bannerConfig.getSnippet(id, topic)
        try { await navigator.clipboard.writeText(text) } catch {}
        const target = lastInput || document.querySelector('div[role="textbox"][contenteditable="true"]') || document.querySelector('textarea')
        if (target) insertIntoInput(target, text)
        btn.textContent = '✅ Injected!'
        setTimeout(() => { btn.textContent = orig }, 1800)
      })
    })
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mountAdaptiveDock)
  else mountAdaptiveDock()
})()
