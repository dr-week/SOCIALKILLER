import { readJsonBody } from '../http/read-json.mjs'
import {
  getSyncedData,
  getAllSyncedAccounts,
  saveSyncedData,
  removeSyncedAccount
} from '../sync-store.mjs'

export async function handleInstagramSyncRoutes(req, res, url, json) {
  if (req.method === 'POST' && url.pathname === '/api/instagram/sync') {
    try {
      const parsed = await readJsonBody(req, 5_000_000)
      if (!Array.isArray(parsed.followers) || !Array.isArray(parsed.following)) {
        return json(res, 400, { error: 'Followers and following arrays are required.' })
      }
      const saved = saveSyncedData(parsed)
      return json(res, 200, {
        success: true,
        countFollowers: saved.followers.length,
        countFollowing: saved.following.length
      })
    } catch (err) {
      return json(res, err.statusCode || 400, { error: err.statusCode === 413 ? 'Payload too large.' : 'Invalid JSON payload.' })
    }
  }

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

  if (req.method === 'DELETE' && url.pathname.startsWith('/api/instagram/accounts')) {
    const username = (url.searchParams.get('username') || url.pathname.split('/').pop() || '').trim()
    if (!username) return json(res, 400, { error: 'Username is required to delete.' })
    return json(res, 200, { success: removeSyncedAccount(username), username })
  }

  if (req.method === 'GET' && url.pathname === '/api/instagram/sync') {
    const username = (url.searchParams.get('username') || '').trim()
    const data = getSyncedData(username || undefined)
    if (!data) return json(res, 200, { synced: false })
    return json(res, 200, { synced: true, data })
  }

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
