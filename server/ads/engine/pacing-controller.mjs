/**
 * Intraday Pacing Controller for ad spend.
 * Computes target cumulative spend curve by hour (0..23) and detects under/over-pacing.
 */

const DEFAULT_HOURLY_WEIGHTS = [
  0.02, 0.015, 0.015, 0.015, 0.02, 0.025,
  0.035, 0.045, 0.055, 0.06, 0.065, 0.065,
  0.06, 0.055, 0.055, 0.055, 0.06, 0.065,
  0.065, 0.06, 0.05, 0.04, 0.03, 0.025,
]

export function evaluateIntradayPacing({ dailyBudget = 100, spendSoFar = 0, hourUtc = new Date().getUTCHours() }) {
  const h = Math.max(0, Math.min(23, Number(hourUtc)))
  const cumulativeWeight = DEFAULT_HOURLY_WEIGHTS.slice(0, h + 1).reduce((s, w) => s + w, 0)
  const expectedSpend = Number((dailyBudget * cumulativeWeight).toFixed(2))
  const ratio = expectedSpend > 0 ? Number((spendSoFar / expectedSpend).toFixed(2)) : 1.0

  let status = 'on_pace'
  if (ratio > 1.25) status = 'over_pacing'
  else if (ratio < 0.75) status = 'under_pacing'

  return {
    hourUtc: h,
    dailyBudget,
    spendSoFar,
    expectedSpend,
    pacingRatio: ratio,
    status,
  }
}
