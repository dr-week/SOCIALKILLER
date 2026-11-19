/**
 * FollowDesk Instagram User & Session Resolver (<150 lines)
 * Extracted from extractor.js to maintain modularity and avoid monolithic scripts.
 */

export const IG_APP_ID = '936619743392459'

export function getCookie(name) {
  const value = `; ${document.cookie}`
  const parts = value.split(`; ${name}=`)
  if (parts.length === 2) return parts.pop().split(';').shift()
  return ''
}

export function getJitterDelay(baseMs, varianceMs) {
  return Math.floor(baseMs + Math.random() * varianceMs)
}

export async function resolveTargetUserMeta(targetUsername, csrfToken = '') {
  const cleanTarget = (targetUsername || '').trim().replace(/^@/, '')
  let userId = null
  let username = cleanTarget
  let isPrivateAccount = false
  let followedByViewer = false

  if (!cleanTarget) return { userId: null, username: null, isPrivateAccount, followedByViewer }

  // Method 1: Web profile info endpoint
  try {
    const profileInfoResp = await fetch(
      `https://www.instagram.com/api/v1/users/web_profile_info/?username=${encodeURIComponent(cleanTarget)}`,
      {
        headers: {
          'X-IG-App-ID': IG_APP_ID,
          'Accept': 'application/json',
          ...(csrfToken ? { 'X-CSRFToken': csrfToken } : {})
        },
        credentials: 'include'
      }
    )
    if (profileInfoResp.ok) {
      const pData = await profileInfoResp.json()
      if (pData?.data?.user?.id) {
        userId = pData.data.user.id
        username = pData.data.user.username || cleanTarget
        if (pData.data.user.is_private) {
          isPrivateAccount = true
          followedByViewer = Boolean(pData.data.user.followed_by_viewer)
        }
        return { userId, username, isPrivateAccount, followedByViewer }
      }
    }
  } catch {}

  // Method 2: GraphQL profile query fallback
  try {
    const gqlQuery = `https://www.instagram.com/graphql/query/?query_hash=d4d7d3cadab6667370249d54143b8707&variables=${encodeURIComponent(JSON.stringify({ username: cleanTarget }))}`
    const gqlResp = await fetch(gqlQuery, {
      headers: { 'X-IG-App-ID': IG_APP_ID, 'Accept': 'application/json' },
      credentials: 'include'
    })
    if (gqlResp.ok) {
      const gqlData = await gqlResp.json()
      if (gqlData?.data?.user?.id) {
        userId = gqlData.data.user.id
        username = gqlData.data.user.username || cleanTarget
      }
    }
  } catch {}

  return { userId, username, isPrivateAccount, followedByViewer }
}

export function resolveLoggedInUserIdFromDOM() {
  // Check script tags for viewerId / actorID
  try {
    const scripts = Array.from(document.querySelectorAll('script[type="application/json"]'))
    for (const s of scripts) {
      const text = s.textContent || ''
      if (text.includes('"viewerId"')) {
        const match = text.match(/"viewerId":"(\d+)"/)
        if (match) return match[1]
      }
      if (text.includes('"actorID"')) {
        const match = text.match(/"actorID":"(\d+)"/)
        if (match) return match[1]
      }
    }
  } catch {}

  // Check localStorage session keys
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i) || ''
      if (key.includes('USER') || key.includes('session') || key.includes('account') || key.includes('Polaris')) {
        const val = localStorage.getItem(key) || ''
        const match = val.match(/"id":"(\d+)"/) || val.match(/"userId":"(\d+)"/)
        if (match) return match[1]
      }
    }
  } catch {}

  return null
}
