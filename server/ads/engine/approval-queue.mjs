/**
 * Human-in-the-Loop (HITL) Approval Queue for Ad Buying AI.
 * Paper-Trade / Dry-Run is enabled by default.
 * Lifecycle: pending_approval -> approved -> executed / rolled_back
 */
import { db } from '../../db/sqlite-engine.mjs'
import { logAuditAction } from '../storage/ads-repo.mjs'

export function enqueueAdAction({ brandId = 'danger-labs', entityId, action, ruleId = '', reason, payload = {}, paperTrade = true }) {
  const id = logAuditAction({
    brandId,
    entityId,
    action,
    ruleId,
    reason,
    status: 'pending_approval',
    payload: { ...payload, paperTrade },
  })
  return { id, status: 'pending_approval', paperTrade }
}

export function transitionAdAction(auditId, nextStatus) {
  const allowed = new Set(['approved', 'executed', 'rolled_back', 'rejected'])
  if (!allowed.has(nextStatus)) {
    throw new Error(`Invalid approval transition: ${nextStatus}`)
  }
  const now = new Date().toISOString()
  const executedAt = nextStatus === 'executed' || nextStatus === 'rolled_back' ? now : null
  const info = db.prepare(`
    UPDATE ad_audit_logs
    SET status = ?, executedAt = COALESCE(?, executedAt)
    WHERE id = ?
  `).run(nextStatus, executedAt, auditId)

  if (info.changes === 0) throw new Error(`Audit action ${auditId} not found`)
  return db.prepare(`SELECT * FROM ad_audit_logs WHERE id = ?`).get(auditId)
}

export function listPendingApprovals(brandId = 'danger-labs') {
  return db.prepare(`
    SELECT * FROM ad_audit_logs
    WHERE brandId = ? AND status = 'pending_approval'
    ORDER BY createdAt DESC
  `).all(brandId)
}
