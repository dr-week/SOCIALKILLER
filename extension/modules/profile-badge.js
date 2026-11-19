// FollowDesk Profile Relationship Badge & Inline Status Pill Content Script
// Inspects active profile header on Instagram Web and displays an optimal status badge:
// "Mutual Friend 🟢", "Follows You (Fan) 🔵", or "Doesn't Follow Back ⚠️"

(function initFollowDeskProfileBadge() {
  const BADGE_ID = 'followdesk-profile-status-pill'
  let lastCheckedUsername = ''
  let checkInFlight = false

  function extractProfileUsername() {
    const path = window.location.pathname.replace(/^\/+|\/+$/g, '')
    if (!path) return null
    const parts = path.split('/')
    const first = parts[0].toLowerCase()

    const reserved = new Set([
      'direct', 'explore', 'reels', 'stories', 'accounts', 'emails',
      'developer', 'about', 'legal', 'privacy', 'terms', 'api'
    ])

    if (parts.length === 1 && !reserved.has(first)) {
      return first
    }
    return null
  }

  async function queryRelationshipStatus(targetUsername) {
    try {
      const resp = await fetch(`http://127.0.0.1:4174/api/instagram/relationship?username=${encodeURIComponent(targetUsername)}`)
      if (!resp.ok) return null
      return await resp.json()
    } catch {
      return null
    }
  }

  function injectBadge(statusData, targetUsername) {
    const existing = document.getElementById(BADGE_ID)
    if (existing) existing.remove()

    // 1. Locate primary header title or action bar
    // Modern Instagram desktop & mobile web headers
    const titleHeader = document.querySelector('header h2, header h1, header section h2')
    const headerActions = document.querySelector('header section, header section > div, main header')
    if (!titleHeader && !headerActions) return

    const pill = document.createElement('div')
    pill.id = BADGE_ID

    // Determine follow-status (either from synced dataset or live Instagram page DOM)
    let isFollower = statusData?.known && statusData.followsMe
    let doesNotFollow = statusData?.known && !statusData.followsMe
    let isMutual = statusData?.relationship === 'mutual'

    // Also check on-page cues: Instagram displays "Follows you" text on user profile headers
    const pageText = document.querySelector('header')?.innerText?.toLowerCase() || ''
    if (pageText.includes('follows you')) {
      isFollower = true
      doesNotFollow = false
    }

    let directAnswer = 'Status: Not Synced Yet'
    let label = 'Unscanned'
    let color = '#8b5cf6'

    if (isMutual) {
      directAnswer = 'YES • Mutual Friend'
      label = 'Mutual Friend 🟢 • Follows You'
      color = '#10b981'
    } else if (isFollower) {
      directAnswer = 'YES • Follows You Back'
      label = 'Follows You (Fan) 🔵'
      color = '#3b82f6'
    } else if (doesNotFollow) {
      directAnswer = "NO • Doesn't Follow Back"
      label = "Doesn't Follow Back ⚠️"
      color = '#f59e0b'
    }

    if (statusData?.whitelisted) {
      label = 'Whitelisted (Protected) ⭐'
      color = '#eab308'
    }

    const tooltip = `Follow Check for @${targetUsername}: ${directAnswer}. Powered by The Social Base.`
    pill.title = tooltip
    pill.innerHTML = `
      <div style="
        display: inline-flex;
        align-items: center;
        gap: 6px;
        background: rgba(15, 23, 42, 0.94);
        backdrop-filter: blur(10px);
        border: 1.5px solid ${color};
        border-radius: 999px;
        padding: 4px 12px;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        font-size: 11px;
        font-weight: 700;
        color: #f8fafc;
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.35);
        cursor: pointer;
        margin: 6px 0;
        transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      ">
        <span style="
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: ${color};
          box-shadow: 0 0 10px ${color};
          display: inline-block;
          animation: followdesk-pulse 2s infinite;
        "></span>
        <span style="letter-spacing: -0.01em;">${label}</span>
      </div>
    `

    pill.onmouseenter = () => {
      pill.style.transform = 'translateY(-1.5px) scale(1.03)'
    }
    pill.onmouseleave = () => {
      pill.style.transform = 'none'
    }

    // Insert next to username row for immediate visibility
    if (titleHeader && titleHeader.parentElement) {
      titleHeader.parentElement.appendChild(pill)
    } else if (headerActions) {
      headerActions.prepend(pill)
    }
  }

  async function checkCurrentProfile() {
    const username = extractProfileUsername()
    if (!username) {
      const existing = document.getElementById(BADGE_ID)
      if (existing) existing.remove()
      lastCheckedUsername = ''
      return
    }

    if (username === lastCheckedUsername && document.getElementById(BADGE_ID)) {
      return
    }

    if (checkInFlight) return
    checkInFlight = true
    lastCheckedUsername = username

    try {
      const statusData = await queryRelationshipStatus(username)
      injectBadge(statusData, username)
    } finally {
      checkInFlight = false
    }
  }

  // Periodic and history change checks for Single-Page Navigation
  setInterval(checkCurrentProfile, 1500)
  window.addEventListener('popstate', () => setTimeout(checkCurrentProfile, 300))
  console.log('✨ [FollowDesk] Profile Inline Relationship Badge active.')
})()
