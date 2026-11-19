import { scanProfile, checkAccountStatus } from '../scanner-service.mjs'
import { getSyncedData, toggleWhitelistAccount, isWhitelisted, getWhitelist } from '../sync-store.mjs'
import { handleInstagramSyncRoutes } from './instagram-sync-routes.mjs'

const usernamePattern = /^[a-zA-Z0-9._]{1,30}$/

export async function handleInstagramRoutes(req, res, url, json) {
  if (req.method === 'GET' && url.pathname === '/api/instagram/profile') {
    const username = (url.searchParams.get('username') || '').trim().replace(/^@/, '')
    if (!usernamePattern.test(username)) return json(res, 400, { error: 'Invalid Instagram username' })
    return json(res, 200, await scanProfile(username))
  }

  if (req.method === 'GET' && url.pathname === '/api/instagram/status') {
    const username = (url.searchParams.get('username') || '').trim().replace(/^@/, '')
    if (!usernamePattern.test(username)) return json(res, 400, { error: 'Invalid Instagram username' })
    return json(res, 200, await checkAccountStatus(username))
  }

  if (req.method === 'GET' && url.pathname === '/api/instagram/relationship') {
    const targetUser = (url.searchParams.get('username') || url.searchParams.get('target') || '').trim().toLowerCase().replace(/^@/, '')
    const myAccount = (url.searchParams.get('viewer') || '').trim().toLowerCase().replace(/^@/, '')
    if (!targetUser) return json(res, 400, { error: 'target username required' })

    const synced = getSyncedData(myAccount || undefined)
    if (!synced || !Array.isArray(synced.followers) || !Array.isArray(synced.following)) {
      return json(res, 200, {
        known: false,
        targetUser,
        viewer: myAccount || null,
        message: 'No synced follower database found. Sync via extension or upload export first.'
      })
    }

    const followersSet = new Set(synced.followers.map(f => (f.username || '').toLowerCase()))
    const followingSet = new Set(synced.following.map(f => (f.username || '').toLowerCase()))
    const followsMe = followersSet.has(targetUser)
    const iFollow = followingSet.has(targetUser)

    let relationship = 'no_relation'
    let label = 'Not Following You'
    let badgeColor = '#94a3b8'
    if (followsMe && iFollow) {
      relationship = 'mutual'; label = 'Mutual Friend 🟢'; badgeColor = '#10b981'
    } else if (followsMe && !iFollow) {
      relationship = 'fan'; label = 'Follows You (Fan) 🔵'; badgeColor = '#3b82f6'
    } else if (!followsMe && iFollow) {
      relationship = 'not_following_back'; label = "Doesn't Follow Back ⚠️"; badgeColor = '#f59e0b'
    }

    const whitelisted = isWhitelisted(targetUser)
    if (whitelisted) {
      label = 'Whitelisted (Protected) ⭐'
      badgeColor = '#eab308'
    }

    return json(res, 200, {
      known: true,
      targetUser,
      viewer: synced.username || myAccount,
      followsMe,
      iFollow,
      whitelisted,
      relationship,
      label,
      badgeColor
    })
  }

  if (url.pathname === '/api/instagram/whitelist') {
    if (req.method === 'POST') {
      const username = (url.searchParams.get('username') || '').trim()
      if (!username) return json(res, 400, { error: 'Username required' })
      return json(res, 200, { success: true, username, whitelisted: toggleWhitelistAccount(username) })
    }
    return json(res, 200, { whitelist: getWhitelist() })
  }

  if (req.method === 'GET' && url.pathname === '/api/instagram/download-proxy') {
    const targetUrl = url.searchParams.get('url')
    const filename = url.searchParams.get('filename') || 'instagram-media.jpg'
    if (!targetUrl || !targetUrl.startsWith('http')) {
      return json(res, 400, { error: 'Valid URL query parameter required.' })
    }
    try {
      const imgRes = await fetch(targetUrl, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
      })
      if (!imgRes.ok) return json(res, imgRes.status, { error: 'Could not fetch image.' })
      const contentType = imgRes.headers.get('content-type') || 'image/jpeg'
      const buffer = Buffer.from(await imgRes.arrayBuffer())
      res.writeHead(200, {
        'content-type': contentType,
        'content-disposition': `attachment; filename="${encodeURIComponent(filename)}"`,
        'access-control-allow-origin': '*',
        'cache-control': 'public, max-age=86400'
      })
      res.end(buffer)
      return true
    } catch {
      return json(res, 502, { error: 'Download proxy failed.' })
    }
  }

  return await handleInstagramSyncRoutes(req, res, url, json)
}
