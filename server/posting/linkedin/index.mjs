/**
 * Official LinkedIn Community Management API Adapter (<160 lines)
 * 
 * Supports:
 * 1. Live LinkedIn Posts API `POST https://api.linkedin.com/rest/posts`
 * 2. Author URN resolution (`urn:li:person:...` or `urn:li:organization:...`)
 * 3. Fallback to LinkedIn Web Share Intent URL (`https://www.linkedin.com/sharing/share-offsite/?text=...`)
 */

import { ensureValidToken } from '../../credential-store.mjs'
import { createLinkedInTextPost } from '../../integrations/linkedin/posts-api.mjs'

export async function post({ title = '', body = '', credentials = {} } = {}) {
  const content = body || title
  const creds = await ensureValidToken('linkedin', credentials)
  const token = creds.accessToken || creds.bearerToken || creds.token || process.env.LINKEDIN_ACCESS_TOKEN
  let authorUrn = creds.authorUrn || process.env.LINKEDIN_PERSON_URN

  // If no authorUrn provided, attempt resolution via /v2/userinfo or /v2/me
  if (token && !authorUrn) {
    try {
      const meRes = await fetch('https://api.linkedin.com/v2/userinfo', {
        headers: { Authorization: `Bearer ${token}` },
        signal: AbortSignal.timeout(3000)
      })
      if (meRes.ok) {
        const meData = await meRes.json()
        if (meData.sub) authorUrn = `urn:li:person:${meData.sub}`
      }
    } catch {}
  }

  // 1. Live LinkedIn Posts API
  if (token && authorUrn) {
    try {
      const published = await createLinkedInTextPost({ token, authorUrn, content })
      return {
        status: 'ok',
        platformId: 'linkedin',
        mode: 'live_api',
        externalId: published.id || undefined,
        externalUrl: 'https://www.linkedin.com/feed/',
        message: `LinkedIn confirmed the post${published.id ? ` (${published.id})` : ''}.`
      }
    } catch (err) {
      console.warn('[LinkedIn Real API] Direct call failed, falling back to intent:', err.message)
      const intentUrl = `https://www.linkedin.com/sharing/share-offsite/?text=${encodeURIComponent(content)}`
      return {
        status: 'ok',
        platformId: 'linkedin',
        mode: 'intent_assisted',
        intentUrl,
        message: `Direct publish failed: ${err.message}. Review and share this post manually.`
      }
    }
  }

  // 2. Verified Web Share Intent Fallback
  const intentUrl = `https://www.linkedin.com/sharing/share-offsite/?text=${encodeURIComponent(content)}`
  return {
    status: 'ok',
    platformId: 'linkedin',
    mode: 'intent_assisted',
    intentUrl,
    message: 'Formatted for LinkedIn. Ready for browser auto-filler.'
  }
}

export async function ping(credentials = {}) {
  const creds = await ensureValidToken('linkedin', credentials)
  const token = creds.accessToken || creds.bearerToken || creds.token
  if (!token) return { connected: false, error: 'No token configured' }
  try {
    const res = await fetch('https://api.linkedin.com/v2/userinfo', {
      headers: { Authorization: `Bearer ${token}` },
      signal: AbortSignal.timeout(4000)
    })
    if (res.ok) {
      const data = await res.json()
      return { connected: true, name: data.name, email: data.email, sub: data.sub }
    }
    return { connected: false, status: res.status }
  } catch (err) {
    return { connected: false, error: err.message }
  }
}

export async function keepAlive() {
  return {
    status: 'alive',
    platformId: 'linkedin',
    timestamp: new Date().toISOString()
  }
}
