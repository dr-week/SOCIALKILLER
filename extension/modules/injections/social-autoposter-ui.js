// UI components for FollowDesk Omni-Channel Extension Auto-Poster (<125 lines)
;(function initAutoPosterUi() {
  function showFloatingPasteBanner(platform, content) {
    if (document.getElementById('__followdesk_paste_banner')) return
    const banner = document.createElement('div')
    banner.id = '__followdesk_paste_banner'
    Object.assign(banner.style, {
      position: 'fixed', top: '18px', left: '50%', transform: 'translateX(-50%)',
      zIndex: '2147483647', background: 'linear-gradient(135deg, #1e1b4b, #0f172a)',
      color: '#f8fafc', border: '1.5px solid #a855f7', borderRadius: '12px',
      padding: '12px 18px', fontSize: '12.5px', boxShadow: '0 12px 30px rgba(0,0,0,0.6)',
      display: 'flex', alignItems: 'center', gap: '12px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    })

    banner.innerHTML = `
      <div style="font-size:18px;">📋</div>
      <div>
        <div style="font-weight:700;color:#38bdf8;">The Social Base Auto-Paste Ready (${platform.toUpperCase()})</div>
        <div style="font-size:11px;color:#94a3b8;">Text copied to clipboard. Click the composer and press <strong>Ctrl+V</strong>.</div>
      </div>
      <button id="__followdesk_paste_copy_btn" style="background:#7c3aed;color:#fff;border:none;padding:6px 12px;border-radius:6px;font-weight:700;cursor:pointer;font-size:11px;">Copy Again</button>
      <button id="__followdesk_paste_close_btn" style="background:transparent;color:#94a3b8;border:none;font-size:16px;cursor:pointer;">✕</button>`

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
          type: 'FOLLOWDESK_MARK_POSTED', postId, platformId: platform, externalUrl: window.location.href
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

  function mountFloatingHudPill(platform, autoFillCurrentPage) {
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

    const fallback = {
      title: 'Zuari (@zuari/core) <2.5KB: Zero-VDOM Reactive Web, 120 FPS WebXR & Wasm',
      content: 'Shipped github.com/dr-week/fast-framework (Zuari <2.5KB) — 0% Virtual DOM, 0ms hydration, 120 FPS WebXR spatial HUDs & zero-copy Rust/Zig Wasm FFI! 🚀'
    }

    pill.addEventListener('click', async () => {
      pill.textContent = '⏳ Pulling...'
      try {
        const res = await fetch('http://127.0.0.1:4174/api/social/posts')
        if (res.ok) {
          const latest = (await res.json())?.posts?.[0]
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
        await autoFillCurrentPage(fallback)
      } catch {
        await autoFillCurrentPage(fallback)
      }
      pill.textContent = `⚡ Auto-Fill ${platform.toUpperCase()}`
    })
    document.body.appendChild(pill)
  }

  window.__followdeskAutoPosterUi = {
    showFloatingPasteBanner,
    mountMarkPostedButton,
    showPageToast,
    mountFloatingHudPill
  }
})()
