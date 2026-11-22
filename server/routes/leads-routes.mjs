import { randomUUID } from 'node:crypto'
import { db } from '../db/sqlite-engine.mjs'

const MAX_BODY_BYTES = 16_000
const listStmt = db.prepare(`SELECT * FROM leads WHERE brandId = ? ORDER BY updatedAt DESC`)
const listByStatusStmt = db.prepare(`SELECT * FROM leads WHERE brandId = ? AND status = ? ORDER BY updatedAt DESC`)
const getStmt = db.prepare(`SELECT * FROM leads WHERE id = ? AND brandId = ?`)
const insertStmt = db.prepare(`
  INSERT INTO leads (id, brandId, contactName, handle, platformId, source, triggerWord, message, email, phone, intent, status, notes, createdAt, updatedAt)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`)
const updateStmt = db.prepare(`
  UPDATE leads SET contactName = ?, handle = ?, platformId = ?, source = ?, triggerWord = ?, message = ?, email = ?, phone = ?, intent = ?, status = ?, notes = ?, updatedAt = ?
  WHERE id = ? AND brandId = ?
`)
const updateStatusStmt = db.prepare(`UPDATE leads SET status = ?, updatedAt = ? WHERE id = ? AND brandId = ?`)
const deleteStmt = db.prepare(`DELETE FROM leads WHERE id = ? AND brandId = ?`)

async function readBody(req) {
  let raw = ''
  for await (const chunk of req) {
    raw += chunk.toString()
    if (Buffer.byteLength(raw) > MAX_BODY_BYTES) throw Object.assign(new Error('Request too large.'), { status: 413 })
  }
  try { return JSON.parse(raw || '{}') } catch { throw Object.assign(new Error('Invalid JSON.'), { status: 400 }) }
}

export async function handleLeadsRoutes(req, res, url, json) {
  if (!url.pathname.startsWith('/api/leads')) return false
  const brandId = url.searchParams.get('brandId') || 'danger-labs'
  try {
    if (req.method === 'GET' && url.pathname === '/api/leads') {
      const status = url.searchParams.get('status')
      const leads = status ? listByStatusStmt.all(brandId, status) : listStmt.all(brandId)
      return json(res, 200, { success: true, count: leads.length, leads })
    }

    if (req.method === 'POST' && url.pathname === '/api/leads') {
      const b = await readBody(req)
      const bid = String(b.brandId || brandId).trim()
      const contactName = String(b.contactName || 'New Lead').trim().slice(0, 100)
      const handle = String(b.handle || '').trim().slice(0, 100)
      const platformId = String(b.platformId || 'instagram').trim().slice(0, 40)
      const source = String(b.source || 'comment').trim().slice(0, 40)
      const triggerWord = String(b.triggerWord || '').trim().slice(0, 50)
      const message = String(b.message || '').trim().slice(0, 5000)
      const email = String(b.email || '').trim().slice(0, 120)
      const phone = String(b.phone || '').trim().slice(0, 40)
      const intent = String(b.intent || 'inquiry').trim().slice(0, 40)
      const status = ['new', 'contacted', 'qualified', 'proposal', 'won', 'lost'].includes(b.status) ? b.status : 'new'
      const notes = String(b.notes || '').trim().slice(0, 5000)
      const now = new Date().toISOString()
      const id = randomUUID()

      insertStmt.run(id, bid, contactName, handle, platformId, source, triggerWord, message, email, phone, intent, status, notes, now, now)
      return json(res, 201, { success: true, lead: getStmt.get(id, bid) })
    }

    const idMatch = url.pathname.match(/^\/api\/leads\/([a-f0-9-]+)$/i)
    if (idMatch) {
      const [, id] = idMatch
      const existing = getStmt.get(id, brandId)
      if (!existing) return json(res, 404, { success: false, error: 'Lead not found.' })

      if (req.method === 'GET') {
        return json(res, 200, { success: true, lead: existing })
      }

      if (req.method === 'PUT' || req.method === 'PATCH') {
        const b = await readBody(req)
        const now = new Date().toISOString()
        if (b.status && Object.keys(b).length <= 2) {
          const status = ['new', 'contacted', 'qualified', 'proposal', 'won', 'lost'].includes(b.status) ? b.status : existing.status
          updateStatusStmt.run(status, now, id, brandId)
        } else {
          updateStmt.run(
            String(b.contactName ?? existing.contactName).slice(0, 100),
            String(b.handle ?? existing.handle).slice(0, 100),
            String(b.platformId ?? existing.platformId).slice(0, 40),
            String(b.source ?? existing.source).slice(0, 40),
            String(b.triggerWord ?? existing.triggerWord).slice(0, 50),
            String(b.message ?? existing.message).slice(0, 5000),
            String(b.email ?? existing.email).slice(0, 120),
            String(b.phone ?? existing.phone).slice(0, 40),
            String(b.intent ?? existing.intent).slice(0, 40),
            ['new', 'contacted', 'qualified', 'proposal', 'won', 'lost'].includes(b.status) ? b.status : existing.status,
            String(b.notes ?? existing.notes).slice(0, 5000),
            now, id, brandId
          )
        }
        return json(res, 200, { success: true, lead: getStmt.get(id, brandId) })
      }

      if (req.method === 'DELETE') {
        deleteStmt.run(id, brandId)
        return json(res, 200, { success: true, deleted: id })
      }
    }

    return json(res, 404, { success: false, error: 'Lead endpoint not found.' })
  } catch (error) {
    return json(res, error.status || 500, { success: false, error: error.message || 'Leads request failed.' })
  }
}
