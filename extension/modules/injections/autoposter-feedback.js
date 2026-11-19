;(function registerAutoposterFeedback() {
  const api = globalThis.FollowDeskAutoposter || (globalThis.FollowDeskAutoposter = {})

  api.showFloatingPasteBanner = (platform, content) => {
    if (document.getElementById('__followdesk_paste_banner')) return
    const banner = document.createElement('div')
    banner.id = '__followdesk_paste_banner'
    Object.assign(banner.style, {
      position: 'fixed', top: '18px', left: '50%', transform: 'translateX(-50%)', zIndex: '2147483647',
      background: 'linear-gradient(135deg, #1e1b4b, #0f172a)', color: '#f8fafc', border: '1.5px solid #a855f7',
      borderRadius: '12px', padding: '12px 18px', fontSize: '12.5px', boxShadow: '0 12px 30px rgba(0,0,0,.6)',
      display: 'flex', alignItems: 'center', gap: '12px', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    })
    banner.innerHTML = `<div>📋</div><div><strong>The Social Base Auto-Paste Ready (${platform.toUpperCase()})</strong><div>Text copied to clipboard. Click the composer and press <b>Ctrl+V</b>.</div></div><button id="__followdesk_paste_copy_btn">Copy Again</button><button id="__followdesk_paste_close_btn">✕</button>`
    document.body.appendChild(banner)
    document.getElementById('__followdesk_paste_copy_btn')?.addEventListener('click', () => {
      void navigator.clipboard.writeText(content)
      const button = document.getElementById('__followdesk_paste_copy_btn')
      if (button) button.textContent = '✓ Copied!'
      setTimeout(() => { if (button) button.textContent = 'Copy Again' }, 2000)
    })
    document.getElementById('__followdesk_paste_close_btn')?.addEventListener('click', () => banner.remove())
    setTimeout(() => { if (banner.parentElement) banner.remove() }, 10000)
  }

  api.mountMarkPostedButton = (postId, platform) => {
    if (document.getElementById('__followdesk_mark_posted')) return
    const button = document.createElement('button')
    button.id = '__followdesk_mark_posted'
    button.type = 'button'
    button.textContent = '✓ Mark posted'
    button.title = 'Tell The Social Base this post is live (updates queue + stats)'
    Object.assign(button.style, {
      position: 'fixed', bottom: '58px', left: '18px', zIndex: '2147483646', background: '#059669', color: '#fff',
      border: '1px solid rgba(255,255,255,.25)', borderRadius: '999px', padding: '7px 13px', fontSize: '11.5px',
      fontWeight: '700', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', cursor: 'pointer'
    })
    button.addEventListener('click', () => markPosted(button, postId, platform))
    document.body.appendChild(button)
  }

  async function markPosted(button, postId, platform) {
    button.disabled = true
    button.textContent = '⏳ Saving...'
    try {
      const result = await chrome.runtime.sendMessage({
        type: 'FOLLOWDESK_MARK_POSTED', postId, platformId: platform, externalUrl: window.location.href
      })
      button.textContent = result?.success ? '✅ Recorded' : '⚠️ Not saved'
    } catch { button.textContent = '⚠️ Not saved' }
    setTimeout(() => button.remove(), 2500)
  }
})()
