/**
 * Floating UI Pill and Toast Utilities for Social Autoposter (<110 lines)
 * Extracted from social-autoposter.js to keep files focused and modular.
 */

export function showPageToast(message) {
  let toast = document.getElementById('__followdesk_autopost_toast')
  if (!toast) {
    toast = document.createElement('div')
    toast.id = '__followdesk_autopost_toast'
    Object.assign(toast.style, {
      position: 'fixed',
      bottom: '58px',
      right: '18px',
      zIndex: '2147483647',
      background: 'linear-gradient(135deg, #1e1b4b, #0f172a)',
      color: '#f8fafc',
      border: '1px solid rgba(168, 85, 247, 0.5)',
      borderRadius: '10px',
      padding: '9px 14px',
      fontSize: '12px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      fontWeight: '600',
      boxShadow: '0 10px 25px rgba(0,0,0,0.45)',
      transition: 'opacity 0.25s ease',
      pointerEvents: 'none'
    })
    document.body.appendChild(toast)
  }
  toast.textContent = message
  toast.style.opacity = '1'
  setTimeout(() => {
    if (toast) toast.style.opacity = '0'
  }, 4000)
}

export function mountFloatingHudPill({ platform, onAutoFill }) {
  if (platform === 'unknown' || platform === 'instagram') return
  if (document.getElementById('__followdesk_hud_pill')) return

  const pill = document.createElement('button')
  pill.id = '__followdesk_hud_pill'
  pill.type = 'button'
  pill.textContent = `⚡ Auto-Fill ${platform.toUpperCase()}`
  pill.title = 'Pull latest queued post from The Social Base & auto-fill composer'
  Object.assign(pill.style, {
    position: 'fixed',
    bottom: '18px',
    right: '18px',
    zIndex: '2147483646',
    background: 'linear-gradient(135deg, #7c3aed, #059669)',
    color: '#ffffff',
    border: '1px solid rgba(255,255,255,0.22)',
    borderRadius: '999px',
    padding: '7px 13px',
    fontSize: '11.5px',
    fontWeight: '700',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    cursor: 'pointer',
    boxShadow: '0 6px 20px rgba(0,0,0,0.4)'
  })

  pill.addEventListener('click', async () => {
    pill.textContent = '⏳ Pulling...'
    try {
      const res = await fetch('http://127.0.0.1:4174/api/social/posts')
      if (res.ok) {
        const data = await res.json()
        const latest = data?.posts?.[0]
        if (latest) {
          await onAutoFill({
            title: latest.title || 'Zuari (@zuari/core) <2.5KB Update',
            content: latest.variants?.[platform] || latest.variants?.x || latest.title
          })
          pill.textContent = `✅ Filled ${platform.toUpperCase()}`
          setTimeout(() => { pill.textContent = `⚡ Auto-Fill ${platform.toUpperCase()}` }, 2500)
          return
        }
      }
      await onAutoFill({
        title: 'Zuari (@zuari/core) <2.5KB: Zero-VDOM Reactive Web, 120 FPS WebXR & Wasm',
        content: 'Shipped github.com/dr-week/fast-framework (Zuari <2.5KB) — 0% Virtual DOM, 0ms hydration, 120 FPS WebXR spatial HUDs & zero-copy Rust/Zig Wasm FFI! 🚀'
      })
    } catch {
      await onAutoFill({
        title: 'Zuari (@zuari/core) <2.5KB: Zero-VDOM Reactive Web, 120 FPS WebXR & Wasm',
        content: 'Shipped github.com/dr-week/fast-framework (Zuari <2.5KB) — 0% Virtual DOM, 0ms hydration, 120 FPS WebXR spatial HUDs & zero-copy Rust/Zig Wasm FFI! 🚀'
      })
    }
    pill.textContent = `⚡ Auto-Fill ${platform.toUpperCase()}`
  })

  document.body.appendChild(pill)
}
