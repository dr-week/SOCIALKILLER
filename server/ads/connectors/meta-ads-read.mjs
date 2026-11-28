/**
 * Read-only Meta Marketing API insights connector.
 * Uses AES-256-GCM vault credentials when configured; falls back to paper-trade sample.
 */
import { upsertCampaign, recordDailyMetric } from '../storage/ads-repo.mjs'

const GRAPH_BASE = 'https://graph.facebook.com/v21.0'

export async function pullMetaInsights({ brandId = 'danger-labs', accountId, accessToken, datePreset = 'last_7d' } = {}) {
  if (!accountId || !accessToken) {
    const today = new Date().toISOString().slice(0, 10)
    const sampleId = `meta_demo_${brandId}`
    upsertCampaign({ id: sampleId, brandId, platform: 'meta', name: 'Meta 3-2-2 DCT Prospecting', status: 'ACTIVE', dailyBudget: 50, targetCpa: 22, targetRoas: 3.2 })
    recordDailyMetric({ entityId: sampleId, entityType: 'campaign', platform: 'meta', date: today, spend: 46.5, impressions: 3820, clicks: 72, conversions: 3, revenue: 165, frequency: 1.8 })
    return { source: 'paper_trade_fallback', synced: 1, campaigns: [sampleId] }
  }

  const fields = 'campaign_id,campaign_name,spend,impressions,clicks,actions,action_values,frequency'
  const url = `${GRAPH_BASE}/act_${encodeURIComponent(accountId)}/insights?level=campaign&date_preset=${encodeURIComponent(datePreset)}&fields=${fields}&access_token=${encodeURIComponent(accessToken)}`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Meta Ads read failed (${res.status})`)
  const data = await res.json()
  const rows = Array.isArray(data?.data) ? data.data : []
  const today = new Date().toISOString().slice(0, 10)

  for (const r of rows) {
    const conv = Number(r.actions?.find(a => a.action_type === 'purchase')?.value || 0)
    const rev = Number(r.action_values?.find(a => a.action_type === 'purchase')?.value || 0)
    upsertCampaign({ id: r.campaign_id, brandId, platform: 'meta', name: r.campaign_name, status: 'ACTIVE', dailyBudget: Number(r.spend || 0) })
    recordDailyMetric({ entityId: r.campaign_id, entityType: 'campaign', platform: 'meta', date: today, spend: Number(r.spend || 0), impressions: Number(r.impressions || 0), clicks: Number(r.clicks || 0), conversions: conv, revenue: rev, frequency: Number(r.frequency || 1) })
  }
  return { source: 'meta_graph_api', synced: rows.length, campaigns: rows.map(r => r.campaign_id) }
}
