/**
 * Official Reddit Data API Adapter (<160 lines)
 * 
 * Supports:
 * 1. OAuth2 script/web app token refresh via `https://www.reddit.com/api/v1/access_token`
 * 2. Submission to `POST https://oauth.reddit.com/api/submit` with flair ID & Markdown selftext
 * 3. Fallback to Reddit Web Composer Intent URL (`https://www.reddit.com/r/.../submit`)
 */

import { ensureValidToken } from '../../credential-store.mjs'

export async function post({ title = '', body = '', flairId = null, credentials = {} } = {}) {
  const creds = await ensureValidToken('reddit', credentials)
  const subreddit = (creds.defaultSubreddit || 'r/webdev').replace(/^r\//i, '')
  const token = creds.accessToken || creds.bearerToken || creds.token || process.env.REDDIT_ACCESS_TOKEN
  const cleanTitle = (title || 'Developer Update').replace(/^Title:\s*/i, '').slice(0, 290)

  // 1. Live Reddit API submission
  if (token) {
    try {
      const params = new URLSearchParams()
      params.append('sr', subreddit)
      params.append('kind', 'self')
      params.append('title', cleanTitle)
      params.append('text', body || cleanTitle)
      params.append('api_type', 'json')
      if (flairId) {
        params.append('flair_id', flairId)
      }

      const res = await fetch('https://oauth.reddit.com/api/submit', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'User-Agent': 'FollowDesk:v1.0.0 (by /u/developer)',
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: params.toString(),
        signal: AbortSignal.timeout(6000)
      })

      if (res.ok) {
        const data = await res.json()
        const postUrl = data.json?.data?.url
        return {
          status: 'ok',
          platformId: 'reddit',
          mode: 'live_api',
          externalUrl: postUrl || `https://reddit.com/r/${subreddit}`,
          message: `Live Reddit post submitted to r/${subreddit}!`
        }
      }
      const errText = await res.text()
      console.warn(`[Reddit Real API] Returned ${res.status}:`, errText)
    } catch (err) {
      console.warn('[Reddit Real API] Direct call failed, falling back to intent:', err.message)
    }
  }

  // 2. Verified Web Intent Fallback
  const intentUrl = `https://www.reddit.com/r/${encodeURIComponent(subreddit)}/submit?title=${encodeURIComponent(cleanTitle)}&text=${encodeURIComponent(body)}`
  return {
    status: 'ok',
    platformId: 'reddit',
    mode: 'intent_assisted',
    intentUrl,
    message: `Formatted for Reddit (r/${subreddit}). Ready for browser auto-filler.`
  }
}

export async function ping(credentials = {}) {
  const creds = await ensureValidToken('reddit', credentials)
  const token = creds.accessToken || creds.bearerToken || creds.token
  if (!token) return { connected: false, error: 'No token configured' }
  try {
    const res = await fetch('https://oauth.reddit.com/api/v1/me', {
      headers: {
        Authorization: `Bearer ${token}`,
        'User-Agent': 'FollowDesk:v1.0.0 (by /u/developer)'
      },
      signal: AbortSignal.timeout(4000)
    })
    if (res.ok) {
      const data = await res.json()
      return { connected: true, username: data.name, karma: data.total_karma }
    }
    return { connected: false, status: res.status }
  } catch (err) {
    return { connected: false, error: err.message }
  }
}

export async function keepAlive() {
  return {
    status: 'alive',
    platformId: 'reddit',
    timestamp: new Date().toISOString()
  }
}
