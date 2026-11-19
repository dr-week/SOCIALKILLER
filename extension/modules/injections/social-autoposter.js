/**
 * FollowDesk Omni-Channel Extension Auto-Poster Content Script
 * Runs on X/Twitter, Reddit, LinkedIn, Dev.to, Hashnode, Medium, GitHub Gist, Discord, Instagram.
 *
 * Features:
 * 1. Automatically checks `FOLLOWDESK_GET_PENDING_AUTOPOST` on page load and fills the composer
 *    (retrying as SPA editors mount).
 * 2. Renders a minimal, icon-driven floating "⚡ FollowDesk Auto-Fill" HUD pill on composer pages
 *    so users can pull the latest post from FollowDesk (`http://127.0.0.1:4174/api/social/posts`)
 *    or auto-fill Zuari (`dr-week/fast-framework`) updates in 1 click.
 */

;(function initFollowDeskSocialAutoPoster() {
  if (window.__followdeskSocialAutoPosterLoaded) return
  window.__followdeskSocialAutoPosterLoaded = true

  function detectCurrentPlatform() {
    const host = window.location.hostname.toLowerCase()
    if (host.includes('twitter.com') || host.includes('x.com')) return 'x'
    if (host.includes('reddit.com')) return 'reddit'
    if (host.includes('linkedin.com')) return 'linkedin'
    if (host.includes('dev.to')) return 'devto'
    if (host.includes('hashnode.com')) return 'hashnode'
    if (host.includes('medium.com')) return 'medium'
    if (host.includes('github.com')) return 'github'
    if (host.includes('discord.com')) return 'discord'
    if (host.includes('instagram.com')) return 'instagram'
    return 'unknown'
  }

  /**
   * Human typing simulation with 60-180ms jitter and natural punctuation pauses
   */
  async function typeHumanCadence(element, text) {
    if (!element || !text) return false
    element.focus()
    // For large posts (>300 chars), type first 30 chars with cadence to satisfy anti-bot listeners, then complete
    const chars = Array.from(text)
    const previewLength = Math.min(chars.length, 35)
    let current = ''

    for (let i = 0; i < previewLength; i++) {
      const char = chars[i]
      current += char
      
      if (element.isContentEditable) {
        document.execCommand('insertText', false, char)
      } else {
        element.value = current
      }
      element.dispatchEvent(new InputEvent('input', { bubbles: true, data: char, inputType: 'insertText' }))

      // Natural jitter: 60-180ms with extra delay for commas/periods/newlines
      let delay = Math.floor(Math.random() * (180 - 60 + 1)) + 60
      if (char === '.' || char === '!' || char === '?' || char === '\n') {
        delay += 150
      } else if (char === ',' || char === ';' || char === ':') {
        delay += 80
      }
      await new Promise(r => setTimeout(r, delay))
    }

    // Insert remaining text in one batch to maintain efficiency while retaining human event trail
    if (chars.length > previewLength) {
      const remainder = chars.slice(previewLength).join('')
      if (element.isContentEditable) {
        document.execCommand('insertText', false, remainder)
      } else {
        element.value = text
      }
      element.dispatchEvent(new InputEvent('input', { bubbles: true, data: remainder, inputType: 'insertText' }))
      element.dispatchEvent(new Event('change', { bubbles: true }))
    }

    return true
  }

  /**
   * Tier 3 Selector Fallback: Renders a floating visual clipboard paste banner
   * when DOM selectors fail or the host website updates its markup structure.
   */
  function showFloatingPasteBanner(platform, content) {
    if (document.getElementById('__followdesk_paste_banner')) return
    const banner = document.createElement('div')
    banner.id = '__followdesk_paste_banner'
    Object.assign(banner.style, {
      position: 'fixed',
      top: '18px',
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: '2147483647',
      background: 'linear-gradient(135deg, #1e1b4b, #0f172a)',
      color: '#f8fafc',
      border: '1.5px solid #a855f7',
      borderRadius: '12px',
      padding: '12px 18px',
      fontSize: '12.5px',
      boxShadow: '0 12px 30px rgba(0,0,0,0.6)',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    })

    banner.innerHTML = `
      <div style="font-size: 18px;">📋</div>
      <div>
        <div style="font-weight: 700; color: #38bdf8;">The Social Base Auto-Paste Ready (${platform.toUpperCase()})</div>
        <div style="font-size: 11px; color: #94a3b8;">Text copied to clipboard. Click the composer and press <strong>Ctrl+V</strong>.</div>
      </div>
      <button id="__followdesk_paste_copy_btn" style="background: #7c3aed; color: #fff; border: none; padding: 6px 12px; border-radius: 6px; font-weight: 700; cursor: pointer; font-size: 11px;">
        Copy Again
      </button>
      <button id="__followdesk_paste_close_btn" style="background: transparent; color: #94a3b8; border: none; font-size: 16px; cursor: pointer;">
        ✕
      </button>
    `

    document.body.appendChild(banner)
    document.getElementById('__followdesk_paste_copy_btn')?.addEventListener('click', () => {
      navigator.clipboard.writeText(content)
      const btn = document.getElementById('__followdesk_paste_copy_btn')
      if (btn) btn.textContent = '✓ Copied!'
      setTimeout(() => { if (btn) btn.textContent = 'Copy Again' }, 2000)
    })
    document.getElementById('__followdesk_paste_close_btn')?.addEventListener('click', () => banner.remove())
    setTimeout(() => { if (banner.parentElement) banner.remove() }, 10000)
  }

  function setNativeValue(element, value) {
    if (!element) return false
    element.focus()

    if (element.isContentEditable) {
      document.execCommand('selectAll', false, null)
      const inserted = document.execCommand('insertText', false, value)
      if (!inserted) element.textContent = value
      element.dispatchEvent(new InputEvent('input', { bubbles: true, data: value, inputType: 'insertText' }))
      element.dispatchEvent(new Event('change', { bubbles: true }))
      return true
    }

    const prototype =
      element instanceof HTMLTextAreaElement
        ? window.HTMLTextAreaElement.prototype
        : window.HTMLInputElement.prototype
    const valueSetter = Object.getOwnPropertyDescriptor(prototype, 'value')?.set
    if (valueSetter) {
      valueSetter.call(element, value)
    } else {
      element.value = value
    }
    element.dispatchEvent(new Event('input', { bubbles: true }))
    element.dispatchEvent(new Event('change', { bubbles: true }))
    return true
  }

  async function autoFillCurrentPage({ title = '', content = '', autoClickSubmit = false, postId = null } = {}) {
    const platform = detectCurrentPlatform()
    let filled = false

    try {
      await navigator.clipboard.writeText(content || title)
    } catch {}

    for (let attempt = 0; attempt < 6 && !filled; attempt++) {
      if (attempt > 0) await new Promise(r => setTimeout(r, 450))

      if (platform === 'x') {
        // ARIA / Accessibility resilient selectors
        const tweetBox =
          document.querySelector('div[role="textbox"][data-testid="tweetTextarea_0"]') ||
          document.querySelector('div[role="textbox"][aria-label*="post text" i]') ||
          document.querySelector('div[role="textbox"][aria-multiline="true"]') ||
          document.querySelector('div[role="textbox"][contenteditable="true"]')
        if (tweetBox) filled = setNativeValue(tweetBox, content)
        if (filled && autoClickSubmit) {
          const btn =
            document.querySelector('button[data-testid="tweetButton"]') ||
            document.querySelector('button[data-testid="tweetButtonInline"]') ||
            document.querySelector('button[aria-label*="Post" i]')
          if (btn && !btn.disabled) btn.click()
        }
      } else if (platform === 'reddit') {
        const titleInput =
          document.querySelector('textarea[aria-label*="title" i]') ||
          document.querySelector('textarea[placeholder*="Title" i]') ||
          document.querySelector('input[placeholder*="Title" i]') ||
          document.querySelector('[name="title"]')
        if (titleInput && title) setNativeValue(titleInput, title.replace(/^Title:\s*/i, ''))

        const bodyBox =
          document.querySelector('div[role="textbox"][contenteditable="true"]') ||
          document.querySelector('div[role="textbox"][aria-label*="text" i]') ||
          document.querySelector('textarea[placeholder*="text" i]') ||
          document.querySelector('textarea[name="text"]')
        if (bodyBox) filled = setNativeValue(bodyBox, content)

        if (filled && autoClickSubmit) {
          const submitBtn =
            document.querySelector('button[type="submit"]') ||
            document.querySelector('button[aria-label*="Post" i]') ||
            Array.from(document.querySelectorAll('button')).find(b => b.textContent?.trim().toLowerCase() === 'post')
          if (submitBtn && !submitBtn.disabled) setTimeout(() => submitBtn.click(), 600)
        }
      } else if (platform === 'linkedin') {
        const shareBox =
          document.querySelector('.ql-editor[contenteditable="true"]') ||
          document.querySelector('div[role="textbox"][aria-label*="post" i]') ||
          document.querySelector('div[role="textbox"][contenteditable="true"]')
        if (shareBox) filled = setNativeValue(shareBox, content)

        if (filled && autoClickSubmit) {
          const postBtn =
            document.querySelector('button.share-actions__primary-action') ||
            Array.from(document.querySelectorAll('button')).find(b => b.textContent?.trim().toLowerCase() === 'post')
          if (postBtn && !postBtn.disabled) setTimeout(() => postBtn.click(), 600)
        }
      } else if (platform === 'devto') {
        const titleEl =
          document.querySelector('#article-form-title') ||
          document.querySelector('textarea[placeholder*="New post title" i]')
        if (titleEl && title) setNativeValue(titleEl, title)

        const bodyEl =
          document.querySelector('#article_body_markdown') ||
          document.querySelector('textarea[placeholder*="Write your post content" i]')
        if (bodyEl) filled = setNativeValue(bodyEl, content)

        if (filled && autoClickSubmit) {
          const publishBtn =
            document.querySelector('button#publish-button') ||
            Array.from(document.querySelectorAll('button')).find(b => b.textContent?.trim().toLowerCase().includes('publish'))
          if (publishBtn && !publishBtn.disabled) setTimeout(() => publishBtn.click(), 600)
        }
      } else if (platform === 'github') {
        const descInput = document.querySelector('input[name="gist[description]"]')
        if (descInput && title) setNativeValue(descInput, title)

        const filenameInput = document.querySelector('input.js-gist-filename')
        if (filenameInput && !filenameInput.value) {
          setNativeValue(filenameInput, `zuari-pulse-${new Date().toISOString().slice(0, 10)}.md`)
        }
        const codeMirrorContent =
          document.querySelector('.cm-content[contenteditable="true"]') ||
          document.querySelector('div[role="textbox"][contenteditable="true"]') ||
          document.querySelector('textarea.file-editor-textarea')
        if (codeMirrorContent) filled = setNativeValue(codeMirrorContent, content)

        if (filled && autoClickSubmit) {
          const createBtn =
            document.querySelector('button.hx_create-pr-button') ||
            Array.from(document.querySelectorAll('button')).find(b => b.textContent?.trim().toLowerCase().includes('create public gist'))
          if (createBtn && !createBtn.disabled) setTimeout(() => createBtn.click(), 600)
        }
      } else {
        const genericTarget =
          document.querySelector('div[role="textbox"][contenteditable="true"]') ||
          document.querySelector('[contenteditable="true"]') ||
          document.querySelector('textarea')
        if (genericTarget) filled = setNativeValue(genericTarget, content)
      }
    if (!filled) {
      showFloatingPasteBanner(platform, content)
    }

    showPageToast(
      filled
        ? `⚡ The Social Base auto-filled ${platform.toUpperCase()}! (Copied to clipboard)`
        : `📋 Copied ${platform.toUpperCase()} post to clipboard! Press Ctrl+V to paste.`
    )

    if (postId) mountMarkPostedButton(postId, platform)

    return { success: true, platform, filled }
  }

  // One tiny pill: press it after you click Post. Routed through the background worker because pages
  // cannot call the local server directly (the server rejects foreign-origin writes by design).
  function mountMarkPostedButton(postId, platform) {
    if (document.getElementById('__followdesk_mark_posted')) return
    const btn = document.createElement('button')
    btn.id = '__followdesk_mark_posted'
    btn.type = 'button'
    btn.textContent = '✓ Mark posted'
    btn.title = 'Tell The Social Base this post is live (updates queue + stats)'
    Object.assign(btn.style, {
      position: 'fixed', bottom: '58px', left: '18px', zIndex: '2147483646',
      background: '#059669', color: '#fff', border: '1px solid rgba(255,255,255,0.25)',
      borderRadius: '999px', padding: '7px 13px', fontSize: '11.5px', fontWeight: '700',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      cursor: 'pointer', boxShadow: '0 6px 20px rgba(0,0,0,0.4)'
    })
    btn.addEventListener('click', async () => {
      btn.disabled = true
      btn.textContent = '⏳ Saving...'
      try {
        const res = await chrome.runtime.sendMessage({
          type: 'FOLLOWDESK_MARK_POSTED',
          postId,
          platformId: platform,
          externalUrl: window.location.href
        })
        btn.textContent = res?.success ? '✅ Recorded' : '⚠️ Not saved'
      } catch {
        btn.textContent = '⚠️ Not saved'
      }
      setTimeout(() => btn.remove(), 2500)
    })
    document.body.appendChild(btn)
  }

  function showPageToast(message) {
    let toast = document.getElementById('__followdesk_autopost_toast')
    if (!toast) {
      toast = document.createElement('div')
      toast.id = '__followdesk_autopost_toast'
      Object.assign(toast.style, {
        position: 'fixed', bottom: '58px', right: '18px', zIndex: '2147483647',
        background: '#0f172a', color: '#f8fafc', border: '1px solid #a855f7',
        borderRadius: '8px', padding: '8px 12px', fontSize: '12px', fontWeight: '600',
        boxShadow: '0 8px 20px rgba(0,0,0,0.4)', pointerEvents: 'none'
      })
      document.body.appendChild(toast)
    }
    toast.textContent = message
    toast.style.opacity = '1'
    setTimeout(() => { if (toast) toast.style.opacity = '0' }, 3500)
  }

  function mountFloatingHudPill() {
    const platform = detectCurrentPlatform()
    if (platform === 'unknown' || platform === 'instagram') return
    if (document.getElementById('__followdesk_hud_pill')) return

    const pill = document.createElement('button')
    pill.id = '__followdesk_hud_pill'
    pill.type = 'button'
    pill.textContent = `⚡ Auto-Fill ${platform.toUpperCase()}`
    pill.title = 'Pull latest queued post from The Social Base & auto-fill composer'
    Object.assign(pill.style, {
      position: 'fixed', bottom: '18px', right: '18px', zIndex: '2147483646',
      background: 'linear-gradient(135deg, #7c3aed, #059669)', color: '#fff',
      border: '1px solid rgba(255,255,255,0.2)', borderRadius: '999px',
      padding: '7px 13px', fontSize: '11.5px', fontWeight: '700', cursor: 'pointer'
    })

    pill.addEventListener('click', async () => {
      pill.textContent = '⏳ Pulling...'
      try {
        const res = await fetch('http://127.0.0.1:4174/api/social/posts')
        if (res.ok) {
          const data = await res.json()
          const latest = data?.posts?.[0]
          if (latest) {
            await autoFillCurrentPage({
              title: latest.title || 'Zuari (@zuari/core) <2.5KB Update',
              content: latest.variants?.[platform] || latest.variants?.x || latest.title
            })
            pill.textContent = `✅ Filled ${platform.toUpperCase()}`
            setTimeout(() => { pill.textContent = `⚡ Auto-Fill ${platform.toUpperCase()}` }, 2500)
            return
          }
        }
        // Fallback Zuari template if backend queue is empty
        await autoFillCurrentPage({
          title: 'Zuari (@zuari/core) <2.5KB: Zero-VDOM Reactive Web, 120 FPS WebXR & Wasm',
          content: 'Shipped github.com/dr-week/fast-framework (Zuari <2.5KB) — 0% Virtual DOM, 0ms hydration, 120 FPS WebXR spatial HUDs & zero-copy Rust/Zig Wasm FFI! 🚀'
        })
      } catch {
        await autoFillCurrentPage({
          title: 'Zuari (@zuari/core) <2.5KB: Zero-VDOM Reactive Web, 120 FPS WebXR & Wasm',
          content: 'Shipped github.com/dr-week/fast-framework (Zuari <2.5KB) — 0% Virtual DOM, 0ms hydration, 120 FPS WebXR spatial HUDs & zero-copy Rust/Zig Wasm FFI! 🚀'
        })
      }
      pill.textContent = `⚡ Auto-Fill ${platform.toUpperCase()}`
    })

    document.body.appendChild(pill)
  }

  async function checkPendingAutoPostOnLoad() {
    const platform = detectCurrentPlatform()
    if (platform === 'unknown') return
    try {
      const res = await chrome.runtime.sendMessage({
        type: 'FOLLOWDESK_GET_PENDING_AUTOPOST',
        platformId: platform
      })
      if (res?.success && res.item) {
        await autoFillCurrentPage(res.item)
      }
    } catch {}
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      mountFloatingHudPill()
      checkPendingAutoPostOnLoad()
    })
  } else {
    mountFloatingHudPill()
    checkPendingAutoPostOnLoad()
  }

  window.__followdeskAutoFillCurrentPage = autoFillCurrentPage

  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message?.type === 'FOLLOWDESK_AUTO_FILL_POST') {
      ;(async () => {
        const res = await autoFillCurrentPage(message.payload || {})
        sendResponse(res)
      })()
      return true
    }

    return false
  })
})()
