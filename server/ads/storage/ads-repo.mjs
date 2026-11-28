/**
 * Repository for Ad Buying AI storage + rolling CPA/ROAS/CTR queries.
 */
import { randomUUID } from 'node:crypto'
import { db } from '../../db/sqlite-engine.mjs'
import { initializeAdsSchema } from './ads-schema.mjs'

initializeAdsSchema(db)

export function upsertCampaign(c) {
  const now = new Date().toISOString()
  db.prepare(`
    INSERT INTO ad_campaigns (id, brandId, platform, name, objective, status, dailyBudget, targetCpa, targetRoas, framework, updatedAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      name = excluded.name, status = excluded.status, dailyBudget = excluded.dailyBudget,
      targetCpa = excluded.targetCpa, targetRoas = excluded.targetRoas, updatedAt = excluded.updatedAt
  `).run(c.id, c.brandId || 'danger-labs', c.platform, c.name, c.objective || 'conversions', c.status || 'PAUSED', Number(c.dailyBudget || 0), Number(c.targetCpa || 25), Number(c.targetRoas || 3), c.framework || '3-2-2-dct', now)
}

export function upsertAdset(a) {
  const now = new Date().toISOString()
  db.prepare(`
    INSERT INTO ad_adsets (id, campaignId, name, status, dailyBudget, audienceSpec, creativeIdsJson, updatedAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      name = excluded.name, status = excluded.status, dailyBudget = excluded.dailyBudget, updatedAt = excluded.updatedAt
  `).run(a.id, a.campaignId, a.name, a.status || 'PAUSED', Number(a.dailyBudget || 0), JSON.stringify(a.audienceSpec || {}), JSON.stringify(a.creativeIds || []), now)
}

export function recordDailyMetric(m) {
  const id = m.id || `${m.entityId}_${m.date}`
  db.prepare(`
    INSERT INTO ad_metrics_daily (id, entityId, entityType, platform, date, spend, impressions, clicks, conversions, revenue, frequency)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(entityId, date) DO UPDATE SET
      spend = excluded.spend, impressions = excluded.impressions, clicks = excluded.clicks,
      conversions = excluded.conversions, revenue = excluded.revenue, frequency = excluded.frequency
  `).run(id, m.entityId, m.entityType || 'campaign', m.platform, m.date, Number(m.spend || 0), Number(m.impressions || 0), Number(m.clicks || 0), Number(m.conversions || 0), Number(m.revenue || 0), Number(m.frequency || 1))
}

export function listCampaigns(brandId = 'danger-labs') {
  return db.prepare(`SELECT * FROM ad_campaigns WHERE brandId = ? ORDER BY updatedAt DESC`).all(brandId)
}

export function listAdsets(campaignId) {
  return db.prepare(`SELECT * FROM ad_adsets WHERE campaignId = ? ORDER BY updatedAt DESC`).all(campaignId)
}

export function getRollingMetrics(entityId, days = 7) {
  const row = db.prepare(`
    SELECT
      COALESCE(SUM(spend), 0) AS spend,
      COALESCE(SUM(impressions), 0) AS impressions,
      COALESCE(SUM(clicks), 0) AS clicks,
      COALESCE(SUM(conversions), 0) AS conversions,
      COALESCE(SUM(revenue), 0) AS revenue,
      COALESCE(AVG(frequency), 1.0) AS frequency
    FROM ad_metrics_daily
    WHERE entityId = ? AND date >= date('now', ?)
  `).get(entityId, `-${Math.max(1, Number(days))} days`)

  const spend = Number(row?.spend || 0)
  const clicks = Number(row?.clicks || 0)
  const impressions = Number(row?.impressions || 0)
  const conversions = Number(row?.conversions || 0)
  const revenue = Number(row?.revenue || 0)
  return {
    spend,
    impressions,
    clicks,
    conversions,
    revenue,
    frequency: Number((row?.frequency || 1).toFixed(2)),
    ctr: impressions > 0 ? Number(((clicks / impressions) * 100).toFixed(2)) : 0,
    cpa: conversions > 0 ? Number((spend / conversions).toFixed(2)) : spend,
    roas: spend > 0 ? Number((revenue / spend).toFixed(2)) : 0,
  }
}

export function logAuditAction({ brandId = 'danger-labs', entityId, action, ruleId = '', reason, status = 'pending_approval', payload = {} }) {
  const id = `audit_${randomUUID().slice(0, 8)}`
  const now = new Date().toISOString()
  db.prepare(`
    INSERT INTO ad_audit_logs (id, brandId, entityId, action, ruleId, reason, status, payloadJson, createdAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(id, brandId, entityId, action, ruleId, reason, status, JSON.stringify(payload), now)
  return id
}

export function listAuditLogs(brandId = 'danger-labs', limit = 50) {
  return db.prepare(`SELECT * FROM ad_audit_logs WHERE brandId = ? ORDER BY createdAt DESC LIMIT ?`).all(brandId, limit)
}
