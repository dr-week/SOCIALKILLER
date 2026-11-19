// FollowDesk Profile Quick-Whitelist Button
// Injects a 1-click Star/Whitelist button right next to the profile follow button on Instagram Web.
// Allows users to safeguard mutual friends and favorite creators instantly while browsing.

(function initWhitelistInjector() {
  const BUTTON_ID = 'followdesk-quick-whitelist-btn'
  let currentTargetUser = ''
  let inFlight = false

  function extractProfileUsername() {
    const path = window.location.pathname.replace(/^\/+|\/+$/g, '')
    if (!path) return null
    const parts = path.split('/')
    if (parts.length === 1 && !['direct', 'explore', 'reels', 'stories'].includes(parts[0].toLowerCase())) {
      return parts[0].toLowerCase()
    }
    return null
  }

  async function checkWhitelistState(username) {
    try {
      const resp = await fetch(`http://127.0.0.1:4174/api/instagram/relationship?username=${encodeURIComponent(username)}`)
      if (!resp.ok) return false
      const data = await resp.json()
      return Boolean(data.whitelisted)
    } catch {
      return false
    }
  }

  async function toggleWhitelistOnServer(username) {
    try {
      const resp = await fetch(`http://127.0.0.1:4174/api/instagram/whitelist?username=${encodeURIComponent(username)}`, {
        method: 'POST'
      })
      if (!resp.ok) return false
      const data = await resp.json()
      return Boolean(data.whitelisted)
    } catch {
      return false
    }
  }

  function injectWhitelistButton(isWhitelisted, username) {
    const existing = document.getElementById(BUTTON_ID)
    if (existing) existing.remove()

    // Find follow button area in header
    const headerActions = document.querySelector('header section div, header h2 + div, header section button')?.parentElement
    if (!headerActions) return

    const btn = document.createElement('button')
    btn.id = BUTTON_ID
    btn.className = 'followdesk-quick-whitelist-btn'
    btn.title = isWhitelisted
      ? `Protected in The Social Base whitelist (Click to remove)`
      : `Protect @${username} (Add to The Social Base whitelist)`

    function renderContent(active) {
      btn.style.cssText = `
        background: ${active ? 'rgba(234, 179, 8, 0.2)' : 'rgba(255, 255, 255, 0.08)'};
        border: 1px solid ${active ? '#eab308' : 'rgba(255, 255, 255, 0.2)'};
        color: ${active ? '#fde047' : '#f8fafc'};
        border-radius: 8px;
        padding: 6px 12px;
        font-size: 12px;
        font-weight: 600;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        gap: 6px;
        margin-left: 8px;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        transition: all 0.15s ease;
      `
      btn.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="${active ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
        </svg>
        <span>${active ? 'Whitelisted' : 'Whitelist'}</span>
      `
    }

    renderContent(isWhitelisted)

    btn.onclick = async (e) => {
      e.stopPropagation()
      e.preventDefault()
      btn.style.opacity = '0.6'
      const nextState = await toggleWhitelistOnServer(username)
      renderContent(nextState)
      btn.style.opacity = '1'
    }

    headerActions.appendChild(btn)
  }

  async function updateProfileWhitelist() {
    const user = extractProfileUsername()
    if (!user) {
      const existing = document.getElementById(BUTTON_ID)
      if (existing) existing.remove()
      currentTargetUser = ''
      return
    }

    if (user === currentTargetUser && document.getElementById(BUTTON_ID)) return
    if (inFlight) return
    inFlight = true
    currentTargetUser = user

    try {
      const active = await checkWhitelistState(user)
      injectWhitelistButton(active, user)
    } finally {
      inFlight = false
    }
  }

  setInterval(updateProfileWhitelist, 1500)
  window.addEventListener('popstate', () => setTimeout(updateProfileWhitelist, 300))
  console.log('⭐ [FollowDesk Injections] Quick-Whitelist button initialized.')
})()
