import { parseProfileFollowerCount, parseProfileAvatar } from './profile-parser.mjs'

const cache = new Map()

export const browserHeaders = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Accept':
    'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.9',
  'Sec-Fetch-Dest': 'document',
  'Sec-Fetch-Mode': 'navigate',
  'Sec-Fetch-Site': 'none',
  'Sec-Fetch-User': '?1',
  'Upgrade-Insecure-Requests': '1'
}

export async function scanProfile(username) {
  const key = username.toLowerCase()
  const cached = cache.get(key)
  if (cached && cached.expires > Date.now()) return cached.data

  const response = await fetch(`https://www.instagram.com/${encodeURIComponent(username)}/`, {
    headers: browserHeaders,
    redirect: 'manual',
    signal: AbortSignal.timeout(12_000)
  })
  if (!response.ok) {
    throw new Error(
      response.status === 429
        ? 'Instagram is rate limiting profile checks. Try again later.'
        : 'Instagram did not provide this public profile page.'
    )
  }
  const html = (await response.text()).slice(0, 1_500_000)
  const followers = parseProfileFollowerCount(html, username)
  const avatarUrl = parseProfileAvatar(html)
  if (!followers) {
    throw new Error(
      'Could not read a follower count from the public profile page. Instagram may require sign-in or limit this request.'
    )
  }

  const data = {
    username,
    profileUrl: `https://www.instagram.com/${encodeURIComponent(username)}/`,
    avatarUrl,
    followers,
    scannedAt: new Date().toISOString(),
    source: 'public Instagram profile page'
  }
  cache.set(key, { data, expires: Date.now() + 60_000 })
  return data
}

export async function checkAccountStatus(username) {
  const key = `status:${username.toLowerCase()}`
  const cached = cache.get(key)
  if (cached && cached.expires > Date.now()) return cached.data

  try {
    const response = await fetch(`https://www.instagram.com/${encodeURIComponent(username)}/`, {
      headers: browserHeaders,
      redirect: 'manual',
      signal: AbortSignal.timeout(8_000)
    })

    let status = 'active'
    let reason = 'Active public or private account'

    if (response.status === 404) {
      status = 'deactivated'
      reason = 'User not found (Deactivated, renamed, or banned)'
    } else if (response.status === 301 || response.status === 302) {
      status = 'active'
      reason = 'Redirected to login / Private account'
    } else if (response.status === 429) {
      status = 'rate_limited'
      reason = 'Instagram temporary rate limit'
    } else if (response.status === 200) {
      // Instagram serves HTTP 200 for missing profiles in web SPA. Check metadata tags.
      const html = (await response.text()).slice(0, 50_000)
      const hasOgTitle = html.includes('og:title')
      const hasOgDesc = html.includes('og:description')
      if (!hasOgTitle && !hasOgDesc) {
        status = 'deactivated'
        reason = 'User not found (Deactivated, renamed, or does not exist)'
      }
    }

    const data = { username, status, reason, checkedAt: new Date().toISOString() }
    cache.set(key, { data, expires: Date.now() + 120_000 })
    return data
  } catch (err) {
    return {
      username,
      status: 'unknown',
      reason: err instanceof Error ? err.message : 'Network error',
      checkedAt: new Date().toISOString()
    }
  }
}
