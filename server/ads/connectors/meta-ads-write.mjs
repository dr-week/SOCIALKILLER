/**
 * Live Meta Marketing API executor (pause/activate/budget update).
 * Defaults to paper-trade dry-run unless paperTrade === false and accessToken is provided.
 */
import { transitionAdAction } from '../engine/approval-queue.mjs'

const GRAPH_BASE = 'https://graph.facebook.com/v21.0'

export async function executeMetaAdAction({ auditId, entityId, action, dailyBudgetCents, accessToken, paperTrade = true }) {
  if (paperTrade || !accessToken) {
    if (auditId) transitionAdAction(auditId, 'executed')
    return { ok: true, mode: 'paper_trade', entityId, action, dailyBudgetCents }
  }

  const params = new URLSearchParams({ access_token: accessToken })
  if (action === 'PAUSE_CAMPAIGN') params.set('status', 'PAUSED')
  else if (action === 'ACTIVATE_CAMPAIGN') params.set('status', 'ACTIVE')
  else if (action === 'SCALE_BUDGET' && dailyBudgetCents) params.set('daily_budget', String(Math.round(dailyBudgetCents)))

  const res = await fetch(`${GRAPH_BASE}/${encodeURIComponent(entityId)}`, {
    method: 'POST',
    body: params,
  })
  if (!res.ok) throw new Error(`Meta Ads write failed (${res.status})`)
  const data = await res.json()
  if (auditId) transitionAdAction(auditId, 'executed')
  return { ok: true, mode: 'live_api', entityId, action, response: data }
}
