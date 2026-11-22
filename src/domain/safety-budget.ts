import type { PacingPreset } from '../composables/useUnfollowQueue'

export interface SafetyBudgetSummary {
  hourlyCount: number
  dailyCount: number
  hourlyLimit: number
  dailyLimit: number
  cooldownActive: boolean
  recommendedPreset: PacingPreset
  tier: 'safe' | 'caution' | 'cooldown'
}

export function evaluateSafetyBudget(
  hourlyCount: number,
  dailyCount: number,
  hourlyLimit = 15,
  dailyLimit = 60
): SafetyBudgetSummary {
  const cooldownActive = hourlyCount >= hourlyLimit || dailyCount >= dailyLimit
  const caution = !cooldownActive && (hourlyCount >= Math.floor(hourlyLimit * 0.65) || dailyCount >= Math.floor(dailyLimit * 0.65))
  const tier = cooldownActive ? 'cooldown' : caution ? 'caution' : 'safe'
  const recommendedPreset: PacingPreset = tier === 'cooldown' || tier === 'caution' ? 'ultra' : hourlyCount >= 5 ? 'balanced' : 'fast'

  return { hourlyCount, dailyCount, hourlyLimit, dailyLimit, cooldownActive, recommendedPreset, tier }
}

export async function recordUnfollowAction(username: string, status: 'completed' | 'skipped'): Promise<SafetyBudgetSummary | null> {
  try {
    const res = await fetch('/api/audience/unfollow-log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, status })
    })
    if (!res.ok) return null
    const data = await res.json()
    return evaluateSafetyBudget(data.hourlyCount || 0, data.dailyCount || 0, data.hourlyLimit || 15, data.dailyLimit || 60)
  } catch {
    return null
  }
}
