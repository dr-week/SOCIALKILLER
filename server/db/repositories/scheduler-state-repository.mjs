export function createSchedulerStateRepository(statements) {
  const { insertIdempotencyStmt, getIdempotencyStmt, getIdempotencyByHashStmt, cleanExpiredTokensStmt, setSchedulerStateStmt, getSchedulerStateStmt } = statements
  return {
  recordIdempotencyToken({ token, scope = 'broadcast', source = 'local', payloadHash = null, metadata = null, ttlHours = 72 }) {
    const now = new Date()
    const createdAt = now.toISOString()
    const expiresAt = ttlHours ? new Date(now.getTime() + ttlHours * 3600 * 1000).toISOString() : null
    try {
      insertIdempotencyStmt.run(
        token,
        scope,
        source,
        payloadHash || null,
        metadata ? JSON.stringify(metadata) : null,
        createdAt,
        expiresAt
      )
      return { success: true, token, recorded: true }
    } catch (err) {
      if (String(err.message).includes('UNIQUE constraint failed')) {
        return { success: false, duplicate: true, token, error: 'Token already processed' }
      }
      throw err
    }
  },

  hasIdempotencyToken(token) {
    if (!token) return false
    const row = getIdempotencyStmt.get(token)
    if (!row) return false
    if (row.expiresAt && new Date(row.expiresAt).getTime() < Date.now()) {
      return false
    }
    return true
  },

  findIdempotencyByHash(scope, payloadHash) {
    if (!scope || !payloadHash) return null
    const row = getIdempotencyByHashStmt.get(scope, payloadHash)
    if (!row) return null
    if (row.expiresAt && new Date(row.expiresAt).getTime() < Date.now()) {
      return null
    }
    return {
      token: row.token,
      scope: row.scope,
      source: row.source,
      payloadHash: row.payloadHash,
      metadata: row.metadataJson ? JSON.parse(row.metadataJson) : null,
      createdAt: row.createdAt
    }
  },

  pruneExpiredIdempotencyTokens() {
    const changes = cleanExpiredTokensStmt.run(new Date().toISOString())
    return changes
  },

  setSchedulerState(key, value) {
    const valueJson = JSON.stringify(value)
    const updatedAt = new Date().toISOString()
    setSchedulerStateStmt.run(key, valueJson, updatedAt)
    return { key, value, updatedAt }
  },

  getSchedulerState(key, fallback = null) {
    const row = getSchedulerStateStmt.get(key)
    if (!row || !row.valueJson) return fallback
    try {
      return JSON.parse(row.valueJson)
    } catch {
      return fallback
    }
  },
  }
}
