/**
 * Instagram Account & Identity Resolver Helper (<150 lines)
 * Extracted from extension/extractor.js to keep extraction non-monolithic.
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

export function reportProgress(message, data = {}) {
  try {
    chrome.runtime.sendMessage({
      type: 'FOLLOWDESK_PROGRESS',
      message,
      stage: data.stage || 'scan',
      count: data.count ?? null,
      total: data.total ?? null
    })
  } catch {}
}

/**
 * Resolves account credentials, numeric user ID, and username from DOM/Cookies/APIs
 */
export async function resolveInstagramIdentity(options = {}) {
  let userId = options.userId || getCookie('ds_user_id')
  let csrfToken = options.csrfToken || getCookie('csrftoken')
  let username = null
  let isPrivateAccount = false
  let followedByViewer = false
  const targetUsername = (options.targetUsername || '').trim().replace(/^@/, '')

  if (targetUsername) {
    username = targetUsername
    try {
      reportProgress(`Resolving profile ID for @${targetUsername}...`, { stage: 'resolving' })
      const profileInfoResp = await fetch(`https://www.instagram.com/api/v1/users/web_profile_info/?username=${encodeURIComponent(targetUsername)}`, {
        headers: {
          'X-IG-App-ID': IG_APP_ID,
          'Accept': 'application/json',
          ...(csrfToken ? { 'X-CSRFToken': csrfToken } : {})
        },
        credentials: 'include'
      })
      if (profileInfoResp.ok) {
        const pData = await profileInfoResp.json()
        if (pData?.data?.user?.id) {
          userId = pData.data.user.id
          username = pData.data.user.username || targetUsername
          if (pData.data.user.is_private) {
            isPrivateAccount = true
            followedByViewer = Boolean(pData.data.user.followed_by_viewer)
          }
        }
      }
    } catch (e) {
      console.warn('Could not fetch web_profile_info for target', targetUsername, e)
    }

    if (!userId) {
      try {
        const gqlQuery = `https://www.instagram.com/graphql/query/?query_hash=d4d7d3cadab6667370249d54143b8707&variables=${encodeURIComponent(JSON.stringify({ username: targetUsername }))}`
        const gqlResp = await fetch(gqlQuery, {
          headers: { 'X-IG-App-ID': IG_APP_ID, 'Accept': 'application/json' },
          credentials: 'include'
        })
        if (gqlResp.ok) {
          const gqlData = await gqlResp.json()
          if (gqlData?.data?.user?.id) {
            userId = gqlData.data.user.id
            username = gqlData.data.user.username || targetUsername
          }
        }
      } catch (errGql) {
        console.warn('GraphQL fallback failed for target', targetUsername, errGql)
      }
    }
  }

  // Check script tags for viewerId / actorID
  if (!userId) {
    try {
      const scripts = Array.from(document.querySelectorAll('script[type="application/json"]'))
      for (const s of scripts) {
        const text = s.textContent || ''
        const mViewer = text.match(/"viewerId":"(\d+)"/)
        if (mViewer) { userId = mViewer[1]; break }
        const mActor = text.match(/"actorID":"(\d+)"/)
        if (mActor) { userId = mActor[1]; break }
      }
    } catch {}
  }

  // Lookup username if still undefined
  if (userId && !username) {
    try {
      const resp = await fetch(`https://www.instagram.com/api/v1/users/${userId}/info/`, {
        headers: {
          'X-IG-App-ID': IG_APP_ID,
          'Accept': 'application/json',
          ...(csrfToken ? { 'X-CSRFToken': csrfToken } : {})
        },
        credentials: 'include'
      })
      if (resp.ok) {
        const data = await resp.json()
        username = data?.user?.username || null
      }
    } catch {}
  }

  return {
    userId,
    username,
    csrfToken,
    isPrivateAccount,
    followedByViewer,
    targetUsername
  }
}
