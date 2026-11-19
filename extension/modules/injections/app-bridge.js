/**
 * FollowDesk Web Dashboard <-> Browser Extension Bridge Content Script
 * Runs on http://127.0.0.1/* and http://localhost/*
 *
 * Responsibilities:
 * 1. Announces `window.__FOLLOWDESK_EXTENSION_READY = true` so the Vue dashboard knows the
 *    FollowDesk Companion browser extension is installed and active.
 * 2. Listens for `FOLLOWDESK_WEB_TO_EXT_DISPATCH` and `FOLLOWDESK_WEB_TO_EXT_KEEPALIVE`
 *    window messages from the web dashboard (`SocialPublisher.vue`) and forwards them
 *    directly to `chrome.runtime.sendMessage` in the extension service worker (`background.js`).
 */

;(function initFollowDeskAppBridge() {
  if (window.__followdeskAppBridgeInitialized) return
  window.__followdeskAppBridgeInitialized = true

  // Inject a DOM marker attribute so Vue components can detect the extension synchronously
  document.documentElement.setAttribute('data-followdesk-extension', 'active')
  window.__FOLLOWDESK_EXTENSION_READY = true

  // Announce readiness to the page
  window.postMessage({ type: 'FOLLOWDESK_EXT_HEARTBEAT', ready: true, timestamp: Date.now() }, '*')

  window.addEventListener('message', async (event) => {
    if (event.source !== window || !event.data || typeof event.data !== 'object') return

    const { type, payload, requestId } = event.data

    if (type === 'FOLLOWDESK_PING') {
      window.postMessage({ type: 'FOLLOWDESK_PONG', ready: true, requestId }, '*')
      return
    }

    if (type === 'FOLLOWDESK_WEB_TO_EXT_CONTEXT') {
      const brandId = String(payload?.brandId || '')
      const frontendPort = Number(payload?.frontendPort)
      if (!/^[a-z0-9-]{1,64}$/.test(brandId) || !Number.isInteger(frontendPort) || frontendPort < 1 || frontendPort > 65535) return
      try { await chrome.runtime.sendMessage({ type: 'FOUNDRYDESK_SET_ACTIVE_BRAND', brandId, frontendPort }) } catch {}
      return
    }

    if (type === 'FOLLOWDESK_WEB_TO_EXT_DISPATCH') {
      try {
        const res = await chrome.runtime.sendMessage({
          type: 'FOLLOWDESK_EXTENSION_DISPATCH',
          items: Array.isArray(payload?.items) ? payload.items : [payload]
        })
        window.postMessage(
          { type: 'FOLLOWDESK_EXT_TO_WEB_RESULT', requestId, result: res },
          '*'
        )
      } catch (err) {
        window.postMessage(
          {
            type: 'FOLLOWDESK_EXT_TO_WEB_RESULT',
            requestId,
            result: { success: false, error: err instanceof Error ? err.message : String(err) }
          },
          '*'
        )
      }
    }

    if (type === 'FOLLOWDESK_WEB_TO_EXT_KEEPALIVE') {
      try {
        const res = await chrome.runtime.sendMessage({
          type: 'FOLLOWDESK_EXTENSION_KEEPALIVE_TABS',
          payload: payload || {}
        })
        window.postMessage(
          { type: 'FOLLOWDESK_EXT_TO_WEB_RESULT', requestId, result: res },
          '*'
        )
      } catch (err) {
        window.postMessage(
          {
            type: 'FOLLOWDESK_EXT_TO_WEB_RESULT',
            requestId,
            result: { success: false, error: err instanceof Error ? err.message : String(err) }
          },
          '*'
        )
      }
    }
  })
})()
