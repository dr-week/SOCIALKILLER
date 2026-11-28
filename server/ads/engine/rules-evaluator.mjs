/**
 * Deterministic Rules Evaluator for Ad Buying AI.
 * - Kill: spend >= 1.5x targetCpa with 0 conversions, OR CTR < 0.8% (with >= 500 impressions)
 * - Scale: conversions >= 2 and CPA <= targetCpa * 0.9 (+20% / 48h, clamped by guardrails)
 * - Fatigue: frequency > 3.2
 */

export function evaluateCampaignRules(campaign, metrics) {
  const decisions = []
  const spend = Number(metrics?.spend || 0)
  const impressions = Number(metrics?.impressions || 0)
  const conversions = Number(metrics?.conversions || 0)
  const ctr = Number(metrics?.ctr || 0)
  const cpa = Number(metrics?.cpa || 0)
  const frequency = Number(metrics?.frequency || 1)
  const targetCpa = Number(campaign?.targetCpa || 25)

  if (spend >= targetCpa * 1.5 && conversions === 0) {
    decisions.push({
      ruleId: 'KILL_BLEEDER_NO_CONV',
      action: 'PAUSE_CAMPAIGN',
      severity: 'critical',
      reason: `Spend ($${spend.toFixed(2)}) >= 1.5x target CPA ($${(targetCpa * 1.5).toFixed(2)}) with 0 conversions`,
    })
  } else if (impressions >= 500 && ctr < 0.8) {
    decisions.push({
      ruleId: 'KILL_LOW_CTR',
      action: 'PAUSE_CAMPAIGN',
      severity: 'high',
      reason: `CTR (${ctr}%) < 0.8% across ${impressions} impressions`,
    })
  }

  if (frequency > 3.2) {
    decisions.push({
      ruleId: 'CREATIVE_FATIGUE',
      action: 'ROTATE_CREATIVE',
      severity: 'medium',
      reason: `Frequency (${frequency}) > 3.2 threshold; creative refresh recommended`,
    })
  }

  if (conversions >= 2 && cpa <= targetCpa * 0.9 && decisions.every(d => d.action !== 'PAUSE_CAMPAIGN')) {
    decisions.push({
      ruleId: 'SCALE_WINNER_20PCT',
      action: 'SCALE_BUDGET',
      severity: 'opportunity',
      scaleFactor: 1.2,
      cooldownHours: 48,
      reason: `CPA ($${cpa}) <= 90% of target ($${targetCpa}) with ${conversions} conversions; eligible for +20% / 48h scale`,
    })
  }

  return decisions
}
