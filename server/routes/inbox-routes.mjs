import { randomUUID } from 'node:crypto'
import { db } from '../db/sqlite-engine.mjs'

const MAX_BODY_BYTES = 12_000
const listStmt = db.prepare(`SELECT * FROM inbox_interactions WHERE brandId = ? ORDER BY updatedAt DESC`)
const insertStmt = db.prepare(`INSERT INTO inbox_interactions (id, brandId, platformId, kind, contactName, message, replyDraft, status, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, '', 'open', ?, ?)`)
const getStmt = db.prepare(`SELECT * FROM inbox_interactions WHERE id = ? AND brandId = ?`)
const updateStmt = db.prepare(`UPDATE inbox_interactions SET replyDraft = ?, status = ?, updatedAt = ? WHERE id = ? AND brandId = ?`)

async function readBody(req) {
  let raw = ''
  for await (const chunk of req) {
    raw += chunk.toString()
    if (Buffer.byteLength(raw) > MAX_BODY_BYTES) throw Object.assign(new Error('Request is too large.'), { status: 413 })
  }
  try { return JSON.parse(raw || '{}') } catch { throw Object.assign(new Error('Request must be valid JSON.'), { status: 400 }) }
}

export function createInboxRoutes({ draftReply }) {
  return async function handleInboxRoutes(req, res, url, json) {
    if (!url.pathname.startsWith('/api/inbox/')) return false
    try {
      if (req.method === 'GET' && url.pathname === '/api/inbox/interactions') {
        const brandId = url.searchParams.get('brandId') || 'danger-labs'
        return json(res, 200, { success: true, interactions: listStmt.all(brandId) })
      }
      if (req.method === 'POST' && url.pathname === '/api/inbox/interactions') {
        const body = await readBody(req)
        const brandId = String(body.brandId || 'danger-labs').trim()
        const platformId = String(body.platformId || '').trim().toLowerCase()
        const kind = body.kind === 'message' ? 'message' : 'comment'
        const contactName = String(body.contactName || 'Customer').trim().slice(0, 100)
        const message = String(body.message || '').trim().slice(0, 5000)
        if (!/^[a-z0-9-]{1,64}$/.test(brandId) || !/^[a-z0-9_-]{1,40}$/.test(platformId) || !message) {
          return json(res, 400, { success: false, error: 'Brand, platform, and message are required.' })
        }
        const now = new Date().toISOString()
        const interaction = { id: randomUUID(), brandId, platformId, kind, contactName, message, replyDraft: '', status: 'open', createdAt: now, updatedAt: now }
        insertStmt.run(interaction.id, brandId, platformId, kind, contactName, message, now, now)
        return json(res, 201, { success: true, interaction })
      }
      const match = url.pathname.match(/^\/api\/inbox\/interactions\/([a-f0-9-]+)\/(draft|status)$/i)
      if (req.method === 'POST' && match) {
        const [, id, action] = match
        const body = await readBody(req)
        const brandId = String(body.brandId || 'danger-labs')
        const interaction = getStmt.get(id, brandId)
        if (!interaction) return json(res, 404, { success: false, error: 'Interaction not found.' })
        let replyDraft = interaction.replyDraft
        let status = interaction.status
        if (action === 'draft') {
          replyDraft = await draftReply({ message: interaction.message, kind: interaction.kind, platformId: interaction.platformId, tone: String(body.tone || '').slice(0, 300) })
          status = 'draft'
        } else {
          status = ['open', 'draft', 'replied', 'needs-human'].includes(body.status) ? body.status : null
          if (!status) return json(res, 400, { success: false, error: 'Invalid interaction status.' })
          if (typeof body.replyDraft === 'string') replyDraft = body.replyDraft.trim().slice(0, 5000)
        }
        updateStmt.run(replyDraft, status, new Date().toISOString(), id, brandId)
        return json(res, 200, { success: true, interaction: getStmt.get(id, brandId) })
      }
      return json(res, 404, { success: false, error: 'Inbox endpoint not found.' })
    } catch (error) {
      return json(res, error.status || 500, { success: false, error: error.message || 'Inbox request failed.' })
    }
  }
}
