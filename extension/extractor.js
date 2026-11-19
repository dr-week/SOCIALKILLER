// Crashproof & Optimized FollowDesk Extractor for Instagram Web (<210 lines)
import { IG_APP_ID, getJitterDelay, reportProgress, resolveInstagramIdentity } from './modules/extractor-identity.js'
import { saveExtractionCheckpoint, loadExtractionCheckpoint, clearExtractionCheckpoint } from './modules/extractor-checkpoint.js'

window.__followdeskExtractor = async function runFollowDeskExtractor(options = {}) {
  window.__followdeskExtractorStopRequested = false
  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

  // 1. Resolve identity
  const identity = await resolveInstagramIdentity(options)
  const { userId, username, csrfToken, isPrivateAccount, targetUsername } = identity

  if (!userId) {
    return {
      success: false,
      error: targetUsername
        ? `Could not resolve Instagram profile ID for @${targetUsername}. Ensure you are logged into Instagram and this profile is public or accessible to your account.`
        : 'Could not detect your logged-in Instagram account ID. Please navigate to https://www.instagram.com in your browser, ensure you are logged in, and try again.'
    }
  }

  const baseHeaders = {
    'X-IG-App-ID': IG_APP_ID,
    'X-ASBD-ID': '198387',
    'X-Requested-With': 'XMLHttpRequest',
    'X-IG-WWW-Claim': '0',
    'Accept': '*/*'
  }
  if (csrfToken) baseHeaders['X-CSRFToken'] = csrfToken

  const accountScope = (username || userId || 'account').toLowerCase()

  // 2. Paginated list fetcher with checkpointing & exponential backoff
  async function fetchList(endpointName) {
    const peopleMap = new Map()
    let hasNext = true
    let nextMaxId = ''
    let consecutiveNetworkErrors = 0
    let rateLimitRetries = 0
    let batchCount = 0

    const checkpoint = await loadExtractionCheckpoint(accountScope, endpointName)
    if (checkpoint && Array.isArray(checkpoint.list) && checkpoint.list.length > 0) {
      for (const p of checkpoint.list) {
        if (p?.username) peopleMap.set(p.username.toLowerCase(), p)
      }
      nextMaxId = checkpoint.nextMaxId || ''
      hasNext = !!nextMaxId
      reportProgress(`Resumed ${endpointName} from checkpoint (${peopleMap.size} loaded)...`)
    } else {
      reportProgress(`Starting to fetch ${endpointName}...`)
    }

    while (hasNext) {
      let url = `https://www.instagram.com/api/v1/friendships/${userId}/${endpointName}/?count=50`
      if (nextMaxId) url += `&max_id=${encodeURIComponent(nextMaxId)}`

      let res
      try {
        res = await fetch(url, { headers: baseHeaders, credentials: 'include' })
      } catch (networkErr) {
        consecutiveNetworkErrors++
        if (consecutiveNetworkErrors >= 4) {
          throw new Error(`Connection dropped while fetching ${endpointName}: ${networkErr.message}`)
        }
        reportProgress(`Network blip, retrying (${consecutiveNetworkErrors}/4)...`)
        await sleep(2500)
        continue
      }

      if (res.status === 429) {
        rateLimitRetries++
        if (rateLimitRetries > 3) {
          throw new Error(`Instagram rate limit reached for ${endpointName}. Progress saved. Please wait 5 minutes and click resume.`)
        }
        const backoffSeconds = Math.min(15 * Math.pow(2, rateLimitRetries - 1), 60)
        reportProgress(`Rate limit paused: cooling down for ${backoffSeconds}s...`)
        await sleep(backoffSeconds * 1000 + Math.random() * 2000)
        continue
      }

      if (!res.ok) {
        if (res.status === 400 || res.status === 403) {
          if (isPrivateAccount || targetUsername) {
            throw new Error(`@${targetUsername || username} is private. Instagram blocks member lists unless they approve your follow request.`)
          }
          throw new Error(`Instagram access restricted (HTTP ${res.status}). Refresh the tab and log in again.`)
        }
        if (res.status === 401) throw new Error(`Instagram session expired (HTTP 401). Please log in to Instagram again.`)
        throw new Error(`Instagram returned HTTP ${res.status} while fetching ${endpointName}.`)
      }

      consecutiveNetworkErrors = 0
      rateLimitRetries = 0

      const json = await res.json()
      for (const u of (json.users || [])) {
        if (u?.username) {
          const norm = u.username.toLowerCase()
          if (!peopleMap.has(norm)) {
            peopleMap.set(norm, {
              username: u.username,
              href: `https://www.instagram.com/${encodeURIComponent(u.username)}/`
            })
          }
        }
      }

      nextMaxId = json.next_max_id || ''
      hasNext = !!nextMaxId

      if (window.__followdeskExtractorStopRequested) {
        reportProgress(`Stopped by user. Preserving ${peopleMap.size} ${endpointName}...`, {
          stage: endpointName,
          count: peopleMap.size,
          stopped: true
        })
        break
      }

      await saveExtractionCheckpoint(accountScope, endpointName, [...peopleMap.values()], nextMaxId)
      reportProgress(`Fetched ${peopleMap.size} ${endpointName}...`, { stage: endpointName, count: peopleMap.size })

      if (hasNext) {
        batchCount = (batchCount || 0) + 1
        if (batchCount % 5 === 0) {
          reportProgress(`Pacing safety pause (simulating human scroll)...`, { stage: 'pacing', count: peopleMap.size })
          await sleep(getJitterDelay(2800, 1200))
        } else {
          await sleep(getJitterDelay(1400, 800))
        }
      }
    }

    if (!window.__followdeskExtractorStopRequested) {
      await clearExtractionCheckpoint(accountScope, endpointName)
    }

    return [...peopleMap.values()]
  }

  try {
    const followers = await fetchList('followers')
    if (window.__followdeskExtractorStopRequested) {
      return {
        success: true,
        username: username || 'instagram_user',
        followers,
        following: [],
        partial: true,
        extractedAt: new Date().toISOString()
      }
    }

    reportProgress(`Followers complete. Taking human breather before following list...`, { stage: 'breather', count: followers.length })
    await sleep(getJitterDelay(2500, 1300))
    const following = await fetchList('following')

    return {
      success: true,
      username: username || 'instagram_user',
      followers,
      following,
      partial: window.__followdeskExtractorStopRequested || false,
      extractedAt: new Date().toISOString()
    }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : String(err)
    }
  }
}
