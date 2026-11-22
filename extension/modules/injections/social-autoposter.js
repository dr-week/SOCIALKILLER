/**
 * FollowDesk Omni-Channel Extension Auto-Poster Content Script (<90 lines)
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

  async function autoFillCurrentPage({ title = '', content = '', autoClickSubmit = false, postId = null } = {}) {
    const platform = detectCurrentPlatform()
    const ui = window.__followdeskAutoPosterUi
    const fillers = window.__followdeskAutoPosterFillers
    let filled = false

    try {
      await navigator.clipboard.writeText(content || title)
    } catch {}

    for (let attempt = 0; attempt < 6 && !filled; attempt++) {
      if (attempt > 0) await new Promise(r => setTimeout(r, 450))
      if (fillers) {
        filled = fillers.fillPlatformComposer(platform, { title, content, autoClickSubmit })
      }
    }

    if (!filled && ui) ui.showFloatingPasteBanner(platform, content)
    if (ui) {
      ui.showPageToast(
        filled
          ? `⚡ The Social Base auto-filled ${platform.toUpperCase()}! (Copied to clipboard)`
          : `📋 Copied ${platform.toUpperCase()} post to clipboard! Press Ctrl+V to paste.`
      )
      if (postId) ui.mountMarkPostedButton(postId, platform)
    }

    return { success: true, platform, filled }
  }

  async function checkPendingAutoPostOnLoad() {
    const platform = detectCurrentPlatform()
    if (platform === 'unknown') return
    try {
      const res = await chrome.runtime.sendMessage({
        type: 'FOLLOWDESK_GET_PENDING_AUTOPOST',
        platformId: platform
      })
      if (res?.success && res.item) await autoFillCurrentPage(res.item)
    } catch {}
  }

  function boot() {
    const platform = detectCurrentPlatform()
    window.__followdeskAutoPosterUi?.mountFloatingHudPill(platform, autoFillCurrentPage)
    checkPendingAutoPostOnLoad()
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot)
  else boot()

  window.__followdeskAutoFillCurrentPage = autoFillCurrentPage

  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message?.type === 'FOLLOWDESK_AUTO_FILL_POST') {
      ;(async () => {
        sendResponse(await autoFillCurrentPage(message.payload || {}))
      })()
      return true
    }
    return false
  })
})()
