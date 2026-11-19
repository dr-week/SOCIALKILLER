// FollowDesk Creator Intelligence HUD
// Injects an analytics bar on Instagram profile headers (Audience Quality Score & Follower Ratio)
// Inspired by HypeAuditor & Modash creator vetting systems.

(function initCreatorHudInjector() {
  const HUD_ID = 'followdesk-creator-hud-bar'
  let currentAuditedUser = ''

  function extractProfileUsername() {
    const path = window.location.pathname.replace(/^\/+|\/+$/g, '')
    if (!path) return null
    const parts = path.split('/')
    if (parts.length === 1 && !['direct', 'explore', 'reels', 'stories'].includes(parts[0].toLowerCase())) {
      return parts[0].toLowerCase()
    }
    return null
  }

  function parseCount(text) {
    if (!text) return 0
    const clean = text.trim().toLowerCase().replace(/,/g, '')
    if (clean.endsWith('k')) return parseFloat(clean) * 1000
    if (clean.endsWith('m')) return parseFloat(clean) * 1000000
    return parseInt(clean, 10) || 0
  }

  function calculateQualityScore(followers, following, posts) {
    let score = 70 // baseline
    if (followers > 0 && following > 0) {
      const ratio = followers / following
      if (ratio > 2.0) score += 15 // Healthy organic influence
      else if (ratio < 0.3) score -= 20 // Heavy follow-unfollow bot behavior
    }
    if (posts > 50) score += 10
    else if (posts < 5) score -= 15

    return Math.min(99, Math.max(30, Math.round(score)))
  }

  function injectHud(username) {
    const existing = document.getElementById(HUD_ID)
    if (existing) existing.remove()

    // Find profile statistics items (e.g. "X posts", "Y followers", "Z following")
    const statElements = document.querySelectorAll('header ul li, header section ul li')
    if (statElements.length < 3) return

    const postsText = statElements[0]?.innerText || ''
    const followersText = statElements[1]?.innerText || ''
    const followingText = statElements[2]?.innerText || ''

    const posts = parseCount(postsText)
    const followers = parseCount(followersText)
    const following = parseCount(followingText)

    const qualityScore = calculateQualityScore(followers, following, posts)
    const ratioStr = following > 0 ? (followers / following).toFixed(1) : '—'

    const scoreColor = qualityScore >= 80 ? '#10b981' : (qualityScore >= 60 ? '#f59e0b' : '#ef4444')

    const hud = document.createElement('div')
    hud.id = HUD_ID
    hud.className = 'followdesk-creator-hud'
    hud.style.cssText = `
      margin-top: 14px;
      padding: 10px 14px;
      background: rgba(15, 23, 42, 0.88);
      backdrop-filter: blur(8px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 10px;
      display: flex;
      align-items: center;
      gap: 16px;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      font-size: 11px;
      color: #f8fafc;
      width: fit-content;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
    `

    hud.innerHTML = `
      <div style="display: flex; align-items: center; gap: 6px;">
        <span style="color: #94a3b8; font-weight: 600;">Audience Quality (AQS):</span>
        <strong style="color: ${scoreColor}; font-size: 13px;">${qualityScore}/100</strong>
      </div>
      <div style="width: 1px; height: 14px; background: rgba(255, 255, 255, 0.15);"></div>
      <div style="display: flex; align-items: center; gap: 6px;">
        <span style="color: #94a3b8; font-weight: 600;">Ratio:</span>
        <strong style="color: #60a5fa;">${ratioStr}x</strong>
      </div>
      <div style="width: 1px; height: 14px; background: rgba(255, 255, 255, 0.15);"></div>
      <span style="font-size: 10px; color: #a855f7; font-weight: 700;">FOLLOWDESK HUD</span>
    `

    const headerContainer = document.querySelector('header section, main header')
    if (headerContainer) {
      headerContainer.appendChild(hud)
    }
  }

  function updateHud() {
    const user = extractProfileUsername()
    if (!user) {
      const existing = document.getElementById(HUD_ID)
      if (existing) existing.remove()
      currentAuditedUser = ''
      return
    }

    if (user === currentAuditedUser && document.getElementById(HUD_ID)) return
    currentAuditedUser = user
    injectHud(user)
  }

  setInterval(updateHud, 1800)
  window.addEventListener('popstate', () => setTimeout(updateHud, 300))
  console.log('📊 [FollowDesk Injections] Creator Intelligence HUD initialized.')
})()
