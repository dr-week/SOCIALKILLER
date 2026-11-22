import { db } from '../db/sqlite-engine.mjs'
import { readJsonBody } from '../http/read-json.mjs'

const HOURLY_LIMIT = 15
const DAILY_LIMIT = 60

db.exec(`
  CREATE TABLE IF NOT EXISTS unfollow_action_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL,
    status TEXT NOT NULL,
    accountUsername TEXT NOT NULL DEFAULT 'default',
    createdAt INTEGER NOT NULL
  );
  CREATE INDEX IF NOT EXISTS idx_unfollow_logs_created ON unfollow_action_logs(createdAt);
`)

const insertStmt = db.prepare(
  'INSERT INTO unfollow_action_logs (username, status, accountUsername, createdAt) VALUES (?, ?, ?, ?)'
)
const countSinceStmt = db.prepare(
  "SELECT COUNT(*) as cnt FROM unfollow_action_logs WHERE status = 'completed' AND createdAt >= ?"
)

export function getUnfollowSafetySummary(nowMs = Date.now()) {
  const hourlyCount = Number(countSinceStmt.get(nowMs - 3600_000)?.cnt || 0)
  const dailyCount = Number(countSinceStmt.get(nowMs - 86_400_000)?.cnt || 0)
  const cooldownActive = hourlyCount >= HOURLY_LIMIT || dailyCount >= DAILY_LIMIT
  const recommendedPreset = cooldownActive || hourlyCount >= 10 || dailyCount >= 40
    ? 'ultra'
    : hourlyCount >= 5 || dailyCount >= 20
      ? 'balanced'
      : 'fast'

  return {
    hourlyCount,
    dailyCount,
    hourlyLimit: HOURLY_LIMIT,
    dailyLimit: DAILY_LIMIT,
    cooldownActive,
    recommendedPreset
  }
}

export async function handleUnfollowLogRoutes(req, res, url, json) {
  if (req.method === 'GET' && url.pathname === '/api/audience/unfollow-log/summary') {
    return json(res, 200, { success: true, ...getUnfollowSafetySummary() }), true
  }

  if (req.method === 'POST' && url.pathname === '/api/audience/unfollow-log') {
    try {
      const body = await readJsonBody(req)
      const username = String(body?.username || '').trim().replace(/^@/, '').slice(0, 64)
      const status = body?.status === 'skipped' ? 'skipped' : 'completed'
      const accountUsername = String(body?.accountUsername || 'default').slice(0, 64)
      if (!username) return json(res, 400, { error: 'username is required' }), true

      insertStmt.run(username, status, accountUsername, Date.now())
      return json(res, 201, { success: true, ...getUnfollowSafetySummary() }), true
    } catch (err) {
      return json(res, err.statusCode || 400, { error: err.message || 'Invalid unfollow log payload' }), true
    }
  }

  return false
}
