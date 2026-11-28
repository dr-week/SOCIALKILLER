/**
 * Spend Guardrails & Circuit Breakers for autonomous ad buying.
 * - Hard daily & monthly spend caps
 * - +/-15% max budget shift clamp per cycle
 * - >2x hourly burn rate circuit breaker
 */

export const DEFAULT_GUARDRAILS = {
  maxDailyCap: 250,
  maxMonthlyCap: 5000,
  maxShiftPct: 0.15,
  hourlyBurnMultiplierLimit: 2.0,
}

export function clampBudgetShift(currentBudget, proposedBudget, maxShiftPct = DEFAULT_GUARDRAILS.maxShiftPct) {
  const cur = Math.max(0, Number(currentBudget || 0))
  const prop = Math.max(0, Number(proposedBudget || 0))
  if (cur === 0) return Number(prop.toFixed(2))
  const minAllowed = cur * (1 - maxShiftPct)
  const maxAllowed = cur * (1 + maxShiftPct)
  return Number(Math.min(maxAllowed, Math.max(minAllowed, prop)).toFixed(2))
}

export function checkSpendGuardrails({ currentDailySpend = 0, currentMonthlySpend = 0, proposedDailyBudget = 0, hourlySpend = 0, limits = DEFAULT_GUARDRAILS }) {
  const cfg = { ...DEFAULT_GUARDRAILS, ...limits }
  const reasons = []

  if (proposedDailyBudget > cfg.maxDailyCap) {
    reasons.push(`Proposed daily budget ($${proposedDailyBudget}) exceeds hard daily cap ($${cfg.maxDailyCap})`)
  }
  if (currentMonthlySpend + proposedDailyBudget > cfg.maxMonthlyCap) {
    reasons.push(`Projected monthly spend exceeds hard monthly cap ($${cfg.maxMonthlyCap})`)
  }
  const expectedHourly = proposedDailyBudget > 0 ? proposedDailyBudget / 24 : currentDailySpend / 24
  if (expectedHourly > 0 && hourlySpend > expectedHourly * cfg.hourlyBurnMultiplierLimit) {
    reasons.push(`Circuit breaker tripped: hourly burn ($${hourlySpend.toFixed(2)}/hr) > ${cfg.hourlyBurnMultiplierLimit}x expected ($${expectedHourly.toFixed(2)}/hr)`)
  }

  return {
    allowed: reasons.length === 0,
    circuitBreakerTripped: reasons.some(r => r.startsWith('Circuit breaker')),
    reasons,
  }
}
