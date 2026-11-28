/**
 * REST routes for Ad Buying AI (/api/ads/*).
 */
import { pullMetaInsights } from '../ads/connectors/meta-ads-read.mjs'
import { pullGoogleInsights } from '../ads/connectors/google-ads-read.mjs'
import { auditCampaigns } from '../ads/copilot-auditor.mjs'
import { listCampaigns, getRollingMetrics, listAuditLogs } from '../ads/storage/ads-repo.mjs'
import { evaluateCampaignRules } from '../ads/engine/rules-evaluator.mjs'
import { enqueueAdAction, transitionAdAction, listPendingApprovals } from '../ads/engine/approval-queue.mjs'
import { solveQuboBudget } from '../ads/engine/qubo-budget-solver.mjs'
import { executeMetaAdAction } from '../ads/connectors/meta-ads-write.mjs'

export async function handleAdsRoutes({ req, res, url, json, readJsonBody }) {
  const path = url.pathname
  if (!path.startsWith('/api/ads')) return false

  const brandId = url.searchParams.get('brandId') || 'danger-labs'

  if (req.method === 'GET' && path === '/api/ads/campaigns') {
    const campaigns = listCampaigns(brandId).map(c => ({
      ...c,
      metrics: getRollingMetrics(c.id, 7),
      decisions: evaluateCampaignRules(c, getRollingMetrics(c.id, 7)),
    }))
    return json(res, 200, { ok: true, campaigns })
  }

  if (req.method === 'POST' && path === '/api/ads/sync') {
    const body = await readJsonBody(req)
    const meta = await pullMetaInsights({ brandId: body.brandId || brandId })
    const google = await pullGoogleInsights({ brandId: body.brandId || brandId })
    return json(res, 200, { ok: true, meta, google })
  }

  if (req.method === 'POST' && path === '/api/ads/audit') {
    const body = await readJsonBody(req)
    const audit = await auditCampaigns(body.brandId || brandId, body.days || 7)
    return json(res, 200, { ok: true, ...audit })
  }

  if (req.method === 'GET' && path === '/api/ads/approvals') {
    return json(res, 200, { ok: true, pending: listPendingApprovals(brandId), logs: listAuditLogs(brandId, 30) })
  }

  if (req.method === 'POST' && path === '/api/ads/approvals') {
    const body = await readJsonBody(req)
    const queued = enqueueAdAction({ ...body, brandId: body.brandId || brandId })
    return json(res, 201, { ok: true, ...queued })
  }

  if (req.method === 'POST' && path === '/api/ads/approvals/execute') {
    const body = await readJsonBody(req)
    if (body.decision === 'reject') {
      return json(res, 200, { ok: true, record: transitionAdAction(body.auditId, 'rejected') })
    }
    transitionAdAction(body.auditId, 'approved')
    const result = await executeMetaAdAction({ ...body, paperTrade: body.paperTrade !== false })
    return json(res, 200, { ok: true, result })
  }

  if (req.method === 'POST' && path === '/api/ads/qubo-allocate') {
    const body = await readJsonBody(req)
    const solved = solveQuboBudget(body.channels || [], Number(body.totalBudget || 100))
    return json(res, 200, { ok: true, ...solved })
  }

  return false
}
