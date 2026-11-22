/**
 * QUBO Simulated Annealing Post-Schedule Optimizer (<115 lines)
 * Solves multi-platform posting slot assignment by minimizing quadratic energy:
 *   E(x) = -sum(engagement_i * x_i) + lambda_conflict * sum(overlap_ij * x_i * x_j)
 *          + lambda_cadence * (sum(x_i) - targetCount)^2
 * Runs classically in <1ms on CPU with zero cloud QPU latency or cost.
 */

export const DEFAULT_SLOTS = [
  { id: 'mon_09', day: 'Mon', hour: 9, platform: 'linkedin', engagement: 0.88 },
  { id: 'mon_13', day: 'Mon', hour: 13, platform: 'x', engagement: 0.84 },
  { id: 'tue_10', day: 'Tue', hour: 10, platform: 'reddit', engagement: 0.91 },
  { id: 'tue_17', day: 'Tue', hour: 17, platform: 'x', engagement: 0.86 },
  { id: 'wed_09', day: 'Wed', hour: 9, platform: 'linkedin', engagement: 0.93 },
  { id: 'wed_15', day: 'Wed', hour: 15, platform: 'github', engagement: 0.82 },
  { id: 'thu_11', day: 'Thu', hour: 11, platform: 'x', engagement: 0.89 },
  { id: 'thu_18', day: 'Thu', hour: 18, platform: 'instagram', engagement: 0.87 },
  { id: 'fri_10', day: 'Fri', hour: 10, platform: 'devto', engagement: 0.85 },
  { id: 'fri_14', day: 'Fri', hour: 14, platform: 'discord', engagement: 0.80 }
]

function seededRandom(seed) {
  let s = seed >>> 0
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0
    return s / 0x100000000
  }
}

function computeQuboEnergy(state, slots, targetCount, conflictPenalty, cadencePenalty) {
  let energy = 0
  let selectedCount = 0

  for (let i = 0; i < slots.length; i++) {
    if (!state[i]) continue
    selectedCount++
    energy -= Number(slots[i].engagement || 0.5)

    for (let j = i + 1; j < slots.length; j++) {
      if (!state[j]) continue
      const sameDay = slots[i].day === slots[j].day
      const closeHour = Math.abs((slots[i].hour || 0) - (slots[j].hour || 0)) <= 4
      const samePlatform = slots[i].platform === slots[j].platform
      if (sameDay && closeHour) energy += conflictPenalty
      if (sameDay && samePlatform) energy += conflictPenalty * 1.5
    }
  }

  const diff = selectedCount - targetCount
  energy += cadencePenalty * diff * diff
  return energy
}

export function optimizePostSchedule({
  slots = DEFAULT_SLOTS,
  targetCount = 4,
  iterations = 400,
  seed = 42,
  conflictPenalty = 1.4,
  cadencePenalty = 2.0
} = {}) {
  const start = performance.now()
  const rawList = Array.isArray(slots) && slots.length > 0 ? slots : DEFAULT_SLOTS
  const list = rawList.slice(0, 100)
  const boundedIters = Math.max(10, Math.min(2000, Math.floor(Number(iterations) || 400)))
  const k = Math.max(1, Math.min(list.length, Number(targetCount) || 1))
  const rand = seededRandom(seed)

  let state = list.map((_, idx) => (idx < k ? 1 : 0))
  let currentEnergy = computeQuboEnergy(state, list, k, conflictPenalty, cadencePenalty)
  let bestState = [...state]
  let bestEnergy = currentEnergy

  for (let step = 0; step < boundedIters; step++) {
    const temp = Math.max(0.01, 1.5 * (1 - step / boundedIters))
    const flipIdx = Math.floor(rand() * list.length)
    state[flipIdx] = state[flipIdx] ? 0 : 1

    const nextEnergy = computeQuboEnergy(state, list, k, conflictPenalty, cadencePenalty)
    const delta = nextEnergy - currentEnergy

    if (delta < 0 || Math.exp(-delta / temp) > rand()) {
      currentEnergy = nextEnergy
      if (currentEnergy < bestEnergy) {
        bestEnergy = currentEnergy
        bestState = [...state]
      }
    } else {
      state[flipIdx] = state[flipIdx] ? 0 : 1
    }
  }

  const selectedSlots = list.filter((_, i) => bestState[i] === 1)
  return {
    solver: 'classical-qubo-simulated-annealing',
    selectedSlots,
    selectedCount: selectedSlots.length,
    targetCount: k,
    energy: Number(bestEnergy.toFixed(4)),
    iterations,
    durationMs: Number((performance.now() - start).toFixed(3))
  }
}
