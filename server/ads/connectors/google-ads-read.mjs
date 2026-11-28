/**
 * Read-only Google Ads API insights connector.
 * Uses vault credentials when configured; falls back to paper-trade sample.
 */
import { upsertCampaign, recordDailyMetric } from '../storage/ads-repo.mjs'

export async function pullGoogleInsights({ brandId = 'danger-labs', customerId, accessToken, developerToken } = {}) {
  if (!customerId || !accessToken || !developerToken) {
    const today = new Date().toISOString().slice(0, 10)
    const sampleId = `gads_demo_${brandId}`
    upsertCampaign({ id: sampleId, brandId, platform: 'google', name: 'Google Search High-Intent Exact', status: 'ACTIVE', dailyBudget: 40, targetCpa: 20, targetRoas: 3.5, framework: 'broad-first' })
    recordDailyMetric({ entityId: sampleId, entityType: 'campaign', platform: 'google', date: today, spend: 38.2, impressions: 1450, clicks: 64, conversions: 2, revenue: 140, frequency: 1.2 })
    return { source: 'paper_trade_fallback', synced: 1, campaigns: [sampleId] }
  }

  const query = `SELECT campaign.id, campaign.name, campaign.status, metrics.cost_micros, metrics.impressions, metrics.clicks, metrics.conversions, metrics.conversions_value FROM campaign WHERE segments.date DURING LAST_7_DAYS`
  const res = await fetch(`https://googleads.googleapis.com/v18/customers/${encodeURIComponent(customerId)}/googleAds:searchStream`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'developer-token': developerToken,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query }),
  })
  if (!res.ok) throw new Error(`Google Ads read failed (${res.status})`)
  const chunks = await res.json()
  const rows = (Array.isArray(chunks) ? chunks : []).flatMap(c => c.results || [])
  const today = new Date().toISOString().slice(0, 10)

  for (const r of rows) {
    const id = String(r.campaign?.id || '')
    if (!id) continue
    const spend = Number(r.metrics?.costMicros || 0) / 1_000_000
    upsertCampaign({ id, brandId, platform: 'google', name: r.campaign?.name || id, status: r.campaign?.status || 'PAUSED', dailyBudget: spend })
    recordDailyMetric({ entityId: id, entityType: 'campaign', platform: 'google', date: today, spend, impressions: Number(r.metrics?.impressions || 0), clicks: Number(r.metrics?.clicks || 0), conversions: Number(r.metrics?.conversions || 0), revenue: Number(r.metrics?.conversionsValue || 0), frequency: 1.0 })
  }
  return { source: 'google_ads_api', synced: rows.length, campaigns: rows.map(r => String(r.campaign?.id || '')).filter(Boolean) }
}
