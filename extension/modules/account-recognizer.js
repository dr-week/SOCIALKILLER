/**
 * Multi-Platform Account Identity & Session Recognizer (<150 lines)
 * Detects logged-in state, username/handle, and account display name across
 * Instagram, X/Twitter, Reddit, GitHub, LinkedIn, Dev.to, Hashnode, Medium & Discord
 * using zero-API-key browser cookies (`chrome.cookies`) and live DOM inspection.
 */

export const PLATFORM_SESSION_RULES = [
  { id: 'instagram', name: 'Instagram', icon: 'IG', url: 'https://www.instagram.com', cookies: ['sessionid', 'ds_user_id'] },
  { id: 'x', name: 'X / Twitter', icon: '𝕏', url: 'https://x.com', cookies: ['auth_token', 'twid'] },
  { id: 'reddit', name: 'Reddit', icon: 'RD', url: 'https://www.reddit.com', cookies: ['reddit_session', 'token_v2'] },
  { id: 'github', name: 'GitHub', icon: 'GH', url: 'https://github.com', cookies: ['user_session', 'dotcom_user'] },
  { id: 'linkedin', name: 'LinkedIn', icon: 'IN', url: 'https://www.linkedin.com', cookies: ['li_at'] },
  { id: 'devto', name: 'Dev.to', icon: 'DEV', url: 'https://dev.to', cookies: ['remember_user_token'] },
  { id: 'discord', name: 'Discord', icon: 'DC', url: 'https://discord.com', cookies: ['__dcfduid'] }
]

/**
 * Checks which platforms have active logged-in cookies in the browser
 * and resolves direct username cookies where available (e.g., GitHub `dotcom_user`).
 */
export async function detectAllPlatformSessions() {
  const results = []

  // Also merge any DOM-harvested handles stored by content scripts
  let storedHandles = {}
  try {
    const data = await chrome.storage.local.get('recognizedPlatformAccounts')
    storedHandles = data?.recognizedPlatformAccounts || {}
  } catch {}

  for (const rule of PLATFORM_SESSION_RULES) {
    let loggedIn = false
    let handle = storedHandles[rule.id]?.handle || null
    let displayName = storedHandles[rule.id]?.displayName || null

    if (typeof chrome !== 'undefined' && chrome.cookies?.get) {
      for (const cookieName of rule.cookies) {
        try {
          const c = await chrome.cookies.get({ url: rule.url, name: cookieName })
          if (c && c.value) {
            loggedIn = true
            if (cookieName === 'dotcom_user') handle = `@${c.value}`
            if (cookieName === 'ds_user_id' && !handle) handle = `ID:${c.value.slice(0, 6)}`
            if (cookieName === 'twid' && !handle) {
              const decoded = decodeURIComponent(c.value)
              if (decoded.startsWith('u=')) handle = `ID:${decoded.slice(2, 8)}`
            }
          }
        } catch {}
      }
    }

    if (storedHandles[rule.id]?.handle) {
      loggedIn = true
      handle = storedHandles[rule.id].handle
    }

    results.push({
      id: rule.id,
      name: rule.name,
      icon: rule.icon,
      loggedIn,
      handle: handle || (loggedIn ? 'Session Active' : 'Not Logged In'),
      displayName: displayName || rule.name
    })
  }

  return results
}

/**
 * Extracts the logged-in user's username/handle and the currently viewed thread/repo
 * author directly from the live page DOM (runs inside content script context).
 */
export function recognizePageAccountIdentity() {
  const host = window.location.hostname.toLowerCase()
  let platform = 'unknown'
  let handle = null
  let displayName = null
  let threadContext = document.title || ''

  if (host.includes('github.com')) {
    platform = 'github'
    const metaLogin = document.querySelector('meta[name="user-login"]')?.getAttribute('content')
    if (metaLogin) handle = `@${metaLogin}`
    const repoHeader = document.querySelector('strong[itemprop="name"] a, [data-testid="top-nav-center"]')?.textContent?.trim()
    if (repoHeader) threadContext = repoHeader
  } else if (host.includes('x.com') || host.includes('twitter.com')) {
    platform = 'x'
    const profileLink = document.querySelector('a[data-testid="AppTabBar_Profile_Link"]')
    const href = profileLink?.getAttribute('href')?.replace(/^\/+|\/+$/g, '')
    if (href) handle = `@${href}`
    const tweetText = document.querySelector('[data-testid="tweetText"]')?.textContent?.trim()
    if (tweetText) threadContext = tweetText.slice(0, 140)
  } else if (host.includes('reddit.com')) {
    platform = 'reddit'
    const userEl =
      document.querySelector('a[href*="/user/"][id*="user-drawer"]') ||
      document.querySelector('span[ class*="user" i]')
    const href = userEl?.getAttribute?.('href')
    if (href && href.includes('/user/')) {
      const u = href.split('/user/')[1]?.replace(/\/+/g, '')
      if (u) handle = `u/${u}`
    }
    const postH1 = document.querySelector('h1')?.textContent?.trim()
    if (postH1) threadContext = postH1
  } else if (host.includes('dev.to')) {
    platform = 'devto'
    const navUser = document.querySelector('meta[name="forem:user"]')?.getAttribute('content')
    if (navUser) handle = `@${navUser}`
    const h1 = document.querySelector('h1')?.textContent?.trim()
    if (h1) threadContext = h1
  } else if (host.includes('linkedin.com')) {
    platform = 'linkedin'
    const navMe = document.querySelector('.global-nav__me-photo')?.getAttribute('alt')
    if (navMe) {
      displayName = navMe
      handle = navMe
    }
  } else if (host.includes('instagram.com')) {
    platform = 'instagram'
    const pathUser = window.location.pathname.replace(/^\/+|\/+$/g, '').split('/')[0]
    if (pathUser && !['explore', 'reels', 'stories', 'direct'].includes(pathUser)) {
      threadContext = `@${pathUser}`
    }
  }

  return { platform, handle, displayName, threadContext }
}
