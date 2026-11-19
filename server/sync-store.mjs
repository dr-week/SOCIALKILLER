let syncedData = null
const syncedAccounts = new Map()
const feedbackLogs = []

export function getSyncedData(username) {
  if (username) {
    return syncedAccounts.get(username.toLowerCase()) || null
  }
  return syncedData
}

export function getAllSyncedAccounts() {
  return Array.from(syncedAccounts.values())
}

export function removeSyncedAccount(username) {
  const norm = (username || '').toLowerCase()
  const deleted = syncedAccounts.delete(norm)
  if (syncedData && (syncedData.username || '').toLowerCase() === norm) {
    const remaining = Array.from(syncedAccounts.values())
    syncedData = remaining.length > 0 ? remaining[remaining.length - 1] : null
  }
  return deleted
}

export function saveSyncedData(payload) {
  const normUser = (payload.username || 'user').toLowerCase()
  const accountRecord = {
    followers: payload.followers,
    following: payload.following,
    username: payload.username || 'user',
    partial: Boolean(payload.partial),
    syncedAt: new Date().toISOString()
  }
  syncedAccounts.set(normUser, accountRecord)
  syncedData = accountRecord
  return accountRecord
}

export function addFeedback(item) {
  const feedbackEntry = {
    id: Date.now().toString(36),
    timestamp: new Date().toISOString(),
    type: item.type || 'general',
    rating: item.rating || null,
    message: item.message || '',
    metadata: item.metadata || {}
  }
  feedbackLogs.push(feedbackEntry)
  if (feedbackLogs.length > 100) feedbackLogs.shift()
  return feedbackEntry
}

export function getFeedbackLogs() {
  return feedbackLogs
}

// Whitelist / Safe list storage
const whitelistSet = new Set()

export function getWhitelist() {
  return Array.from(whitelistSet)
}

export function isWhitelisted(username) {
  return whitelistSet.has((username || '').toLowerCase().trim().replace(/^@/, ''))
}

export function toggleWhitelistAccount(username) {
  const norm = (username || '').toLowerCase().trim().replace(/^@/, '')
  if (!norm) return false
  if (whitelistSet.has(norm)) {
    whitelistSet.delete(norm)
    return false
  } else {
    whitelistSet.add(norm)
    return true
  }
}

