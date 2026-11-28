/**
 * Read-only AI Copilot Auditor for ad campaigns.
 * Routes through ai-router.mjs (Ollama -> Gemini -> Offline).
 */
import { routeAiCompletion } from '../assistant/ai-router.mjs'
import { listCampaigns, getRollingMetrics } from './storage/ads-repo.mjs'

export async function auditCampaigns(brandId = 'danger-labs', days = 7) {
  const campaigns = listCampaigns(brandId)
  const summaries = campaigns.map(c => ({
    id: c.id,
    name: c.name,
    platform: c.platform,
    dailyBudget: c.dailyBudget,
    targetCpa: c.targetCpa,
    targetRoas: c.targetRoas,
    metrics: getRollingMetrics(c.id, days),
  }))

  const prompt = [
    'You are an expert performance media buyer.',
    `Audit these ${summaries.length} ad campaigns over the last ${days} days:`,
    JSON.stringify(summaries, null, 2),
    'Return concise, actionable recommendations (Kill, Scale, Creative Refresh, or Hold) with numbers.',
  ].join('\n')

  const ai = await routeAiCompletion({
    prompt,
    systemPrompt: 'Provide concise, deterministic media-buying audit recommendations.',
  })

  return {
    brandId,
    days,
    campaignCount: summaries.length,
    provider: ai.provider || 'offline',
    recommendation: ai.text || ai.reply || 'No recommendations generated.',
    summaries,
  }
}
