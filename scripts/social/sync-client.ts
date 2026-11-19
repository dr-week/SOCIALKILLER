import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { createHash } from 'node:crypto'
import type { SocialPostPayload } from './types.ts'

export interface RemoteSyncOptions {
  apiUrl?: string
  scope?: string
  source?: string
  token?: string
}

export function computeBroadcastIdempotencyToken(
  payload: SocialPostPayload,
  versionTag?: string
): string {
  const version = versionTag || payload.versionTag || 'v0'
  const normalizedText = `${payload.title}|${payload.summary || payload.detailed || ''}`.trim()
  const hash = createHash('sha256').update(normalizedText).digest('hex').slice(0, 16)
  return `broadcast-${version}-${hash}`
}

/**
 * Checks local or remote backend SQLite to verify if this broadcast was already executed.
 * Supports direct local SQLite integration when running on same host, or HTTP API call.
 */
export async function checkIdempotency(
  token: string,
  options: RemoteSyncOptions = {}
): Promise<{ exists: boolean; reason?: string }> {
  const apiUrl = options.apiUrl || process.env.FOLLOWDESK_API || 'http://127.0.0.1:4174'

  // 1. Try direct SQLite if running locally and .data/followdesk.sqlite is available
  try {
    const dbPath = resolve(process.cwd(), '.data', 'followdesk.sqlite')
    if (existsSync(dbPath)) {
      // Dynamic import to avoid breaking environments without node:sqlite
      const { DatabaseSync } = await import('node:sqlite')
      const db = new DatabaseSync(dbPath)
      const stmt = db.prepare('SELECT token FROM idempotency_tokens WHERE token = ?')
      const row = stmt.get(token)
      if (row) {
        return { exists: true, reason: `Found existing idempotency token in local SQLite: ${token}` }
      }
    }
  } catch {
    // Fall back to API
  }

  // 2. Try HTTP API call to FollowDesk server (if running)
  try {
    const res = await fetch(`${apiUrl}/api/social/idempotency?token=${encodeURIComponent(token)}`, {
      signal: AbortSignal.timeout(2000)
    })
    if (res.ok) {
      const data = (await res.json().catch(() => ({}))) as { exists?: boolean }
      if (data.exists) {
        return { exists: true, reason: `Found existing idempotency token via FollowDesk API: ${token}` }
      }
    }
  } catch {
    // API not reachable, proceed safely
  }

  return { exists: false }
}

/**
 * Records the broadcast idempotency token to local SQLite or via FollowDesk API
 */
export async function recordIdempotency(
  token: string,
  payload: SocialPostPayload,
  options: RemoteSyncOptions = {}
): Promise<boolean> {
  const apiUrl = options.apiUrl || process.env.FOLLOWDESK_API || 'http://127.0.0.1:4174'
  const source = options.source || (process.env.GITHUB_ACTIONS ? 'github_actions' : 'local_cli')
  const payloadHash = createHash('sha256')
    .update(`${payload.title}|${payload.summary || payload.detailed || ''}`)
    .digest('hex')

  // 1. Direct local SQLite write
  try {
    const dbPath = resolve(process.cwd(), '.data', 'followdesk.sqlite')
    if (existsSync(dbPath)) {
      const { DatabaseSync } = await import('node:sqlite')
      const db = new DatabaseSync(dbPath)
      const stmt = db.prepare(`
        INSERT OR REPLACE INTO idempotency_tokens (token, scope, source, payloadHash, metadataJson, createdAt, expiresAt)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `)
      const now = new Date()
      const expiresAt = new Date(now.getTime() + 72 * 3600 * 1000).toISOString()
      stmt.run(
        token,
        options.scope || 'broadcast',
        source,
        payloadHash,
        JSON.stringify({ title: payload.title, versionTag: payload.versionTag }),
        now.toISOString(),
        expiresAt
      )
      return true
    }
  } catch {
    // Fall back to HTTP API
  }

  // 2. HTTP API call
  try {
    const res = await fetch(`${apiUrl}/api/social/idempotency`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token,
        scope: options.scope || 'broadcast',
        source,
        payloadHash,
        metadata: { title: payload.title, versionTag: payload.versionTag },
        ttlHours: 72
      }),
      signal: AbortSignal.timeout(3000)
    })
    return res.ok
  } catch {
    return false
  }
}
