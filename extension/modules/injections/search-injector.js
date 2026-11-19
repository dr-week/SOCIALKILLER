// FollowDesk Search Dropdown Injections
// Detects search results in the Instagram search flyout / modal
// and injects instant follow-status pills (Mutual, Doesn't Follow Back, Whitelisted)

(function initSearchInjections() {
  const PROCESSED_ATTR = 'data-followdesk-search-processed'
  const cache = new Map()

  async function queryUserStatus(username) {
    const norm = (username || '').toLowerCase()
    if (cache.has(norm)) return cache.get(norm)

    try {
      const resp = await fetch(`http://127.0.0.1:4174/api/instagram/relationship?username=${encodeURIComponent(norm)}`)
      if (!resp.ok) return null
      const data = await resp.json()
      cache.set(norm, data)
      return data
    } catch {
      return null
    }
  }

  function injectStatusInSearchResult(rowEl) {
    if (rowEl.getAttribute(PROCESSED_ATTR)) return
    rowEl.setAttribute(PROCESSED_ATTR, 'true')

    // Find profile link inside search item
    const linkEl = rowEl.querySelector('a[href^="/"]')
    if (!linkEl) return

    const href = linkEl.getAttribute('href') || ''
    const parts = href.replace(/^\/+|\/+$/g, '').split('/')
    if (parts.length !== 1) return // Must be a direct user profile link

    const username = parts[0].toLowerCase()
    const reserved = new Set(['explore', 'reels', 'stories', 'direct'])
    if (reserved.has(username)) return

    // Create inline micro-badge container
    const badgeSpan = document.createElement('span')
    badgeSpan.className = 'followdesk-search-status-badge'
    badgeSpan.style.cssText = `
      display: inline-flex;
      align-items: center;
      gap: 3px;
      font-size: 10px;
      font-weight: 700;
      padding: 1px 6px;
      border-radius: 999px;
      margin-left: 6px;
      vertical-align: middle;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    `

    // Append to username span or row text
    const textTarget = rowEl.querySelector('span, strong')
    if (textTarget && textTarget.parentElement) {
      textTarget.parentElement.appendChild(badgeSpan)
    } else {
      linkEl.appendChild(badgeSpan)
    }

    // Query and update asynchronously
    queryUserStatus(username).then(data => {
      if (!data || !data.known) return
      badgeSpan.style.background = `${data.badgeColor}22`
      badgeSpan.style.color = data.badgeColor
      badgeSpan.style.border = `1px solid ${data.badgeColor}44`
      badgeSpan.textContent = data.label
      badgeSpan.title = data.followsMe ? `Follows your account!` : `Does NOT follow you back.`
    })
  }

  function scanSearchFlyout() {
    // Look for search flyout elements and user search results
    const searchRows = document.querySelectorAll('div[role="none"] > div > a[role="link"], div[role="dialog"] a[role="link"]')
    searchRows.forEach(row => {
      const parent = row.closest('div[role="none"]') || row
      injectStatusInSearchResult(parent)
    })
  }

  setInterval(scanSearchFlyout, 1200)
  console.log('🔍 [FollowDesk Injections] Search Dropdown Injections initialized.')
})()
