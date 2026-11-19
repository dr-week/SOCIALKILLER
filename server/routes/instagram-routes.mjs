/**
 * Instagram & Audience HTTP Route Handlers (<195 lines)
 * Extracted from server/router.mjs to maintain strict modularity.
 */

import { scanProfile, checkAccountStatus } from '../scanner-service.mjs'
import {
  getSyncedData,
  getAllSyncedAccounts,
  saveSyncedData,
  removeSyncedAccount,
  toggleWhitelistAccount,
  isWhitelisted,
  getWhitelist
} from '../sync-store.mjs'

const usernamePattern = /^[a-zA-Z0-9._]{1,30}$/

export async function handleInstagramRoutes(req, res, url, json) {
  // 1. Live profile check
  if (req.method === 'GET' && url.pathname === '/api/instagram/profile') {
    const username = (url.searchParams.get('username') || '').trim().replace(/^@/, '')
    if (!usernamePattern.test(username)) {
      return json(res, 400, { error: 'Invalid Instagram username' })
    }
    const profile = await scanProfile(username)
    return json(res, 200, profile)
  }

  // 2. Account status check (active, shadowbanned, private)
  if (req.method === 'GET' && url.pathname === '/api/instagram/status') {
    const username = (url.searchParams.get('username') || '').trim().replace(/^@/, '')
    if (!usernamePattern.test(username)) {
      return json(res, 400, { error: 'Invalid Instagram username' })
    }
    const status = await checkAccountStatus(username)
    return json(res, 200, status)
  }

  // 3. Instant follower relationship lookup
  if (req.method === 'GET' && url.pathname === '/api/instagram/relationship') {
    const targetUser = (url.searchParams.get('username') || url.searchParams.get('target') || '').trim().toLowerCase().replace(/^@/, '')
    const myAccount = (url.searchParams.get('viewer') || '').trim().toLowerCase().replace(/^@/, '')

    if (!targetUser) {
      return json(res, 400, { error: 'target username required' })
    }

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

    let relationship = 'stranger'
    let label = 'Does Not Follow You'
    let badgeColor = '#ef4444'

    if (followsMe && iFollow) {
      relationship = 'mutual'
      label = 'Mutual Friend 🟢'
      badgeColor = '#10b981'
    } else if (followsMe && !iFollow) {
      relationship = 'fan'
      label = 'Follows You (Fan) 🔵'
      badgeColor = '#3b82f6'
    } else if (!followsMe && iFollow) {
      relationship = 'not_following_back'
      label = "Doesn't Follow Back ⚠️"
      badgeColor = '#f59e0b'
    } else {
      relationship = 'no_relation'
      label = 'Not Following You'
      badgeColor = '#94a3b8'
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

  // 4. Toggle or get whitelist
  if (url.pathname === '/api/instagram/whitelist') {
    if (req.method === 'POST') {
      const username = (url.searchParams.get('username') || '').trim()
      if (!username) return json(res, 400, { error: 'Username required' })
      const active = toggleWhitelistAccount(username)
      return json(res, 200, { success: true, username, whitelisted: active })
    }
    return json(res, 200, { whitelist: getWhitelist() })
  }

  // 5. Safe Image & Media Download Proxy
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

  // 6. Receive synced export from Chrome Extension companion
  if (req.method === 'POST' && url.pathname === '/api/instagram/sync') {
    let body = ''
    req.on('data', chunk => { body += chunk })
    req.on('end', () => {
      try {
        const parsed = JSON.parse(body)
        if (!Array.isArray(parsed.followers) || !Array.isArray(parsed.following)) {
          return json(res, 400, { error: 'Followers and following arrays are required.' })
        }
        const saved = saveSyncedData(parsed)
        return json(res, 200, {
          success: true,
          countFollowers: saved.followers.length,
          countFollowing: saved.following.length
        })
      } catch {
        return json(res, 400, { error: 'Invalid JSON payload.' })
      }
    })
    return true
  }

  // 7. Read all synced accounts list
  if (req.method === 'GET' && url.pathname === '/api/instagram/accounts') {
    const accounts = getAllSyncedAccounts().map(acc => ({
      username: acc.username,
      followersCount: acc.followers?.length || 0,
      followingCount: acc.following?.length || 0,
      partial: acc.partial || false,
      syncedAt: acc.syncedAt
    }))
    return json(res, 200, { success: true, accounts })
  }

  // 8. Delete a synced account by username
  if (req.method === 'DELETE' && url.pathname.startsWith('/api/instagram/accounts')) {
    const username = (url.searchParams.get('username') || url.pathname.split('/').pop() || '').trim()
    if (!username) {
      return json(res, 400, { error: 'Username is required to delete.' })
    }
    const removed = removeSyncedAccount(username)
    return json(res, 200, { success: removed, username })
  }

  // 9. Read synced data from frontend
  if (req.method === 'GET' && url.pathname === '/api/instagram/sync') {
    const username = (url.searchParams.get('username') || '').trim()
    const data = getSyncedData(username || undefined)
    if (!data) return json(res, 200, { synced: false })
    return json(res, 200, { synced: true, data })
  }

  // 10. Direct Unfollowers Query
  if (req.method === 'GET' && url.pathname === '/api/instagram/unfollowers') {
    const username = (url.searchParams.get('username') || '').trim()
    const data = getSyncedData(username || undefined)
    if (!data || !Array.isArray(data.followers) || !Array.isArray(data.following)) {
      return json(res, 200, {
        success: false,
        message: 'No followers/following database imported yet. Sync via extension or upload export.'
      })
    }

    const followersSet = new Set(data.followers.map(f => (f.username || '').toLowerCase()))
    const followingSet = new Set(data.following.map(f => (f.username || '').toLowerCase()))
    const notFollowingBack = data.following.filter(f => !followersSet.has((f.username || '').toLowerCase()))
    const notFollowedBack = data.followers.filter(f => !followingSet.has((f.username || '').toLowerCase()))
    const mutuals = data.following.filter(f => followersSet.has((f.username || '').toLowerCase()))

    return json(res, 200, {
      success: true,
      username: data.username,
      totalFollowers: data.followers.length,
      totalFollowing: data.following.length,
      notFollowingBackCount: notFollowingBack.length,
      notFollowingBack,
      notFollowedBackCount: notFollowedBack.length,
      notFollowedBack,
      mutualsCount: mutuals.length,
      mutuals,
      syncedAt: data.syncedAt
    })
  }

  return false
}
