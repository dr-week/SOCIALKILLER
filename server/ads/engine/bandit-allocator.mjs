/**
 * Pure-JS Thompson Sampling + UCB1 Bandit Allocator for ad sets & creatives.
 */

function sampleStandardNormal() {
  let u = 0
  let v = 0
  while (u === 0) u = Math.random()
  while (v === 0) v = Math.random()
  return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v)
}

function sampleGamma(shape) {
  if (shape < 1) return sampleGamma(shape + 1) * Math.pow(Math.random(), 1 / shape)
  const d = shape - 1 / 3
  const c = 1 / Math.sqrt(9 * d)
  while (true) {
    let x = sampleStandardNormal()
    let v = 1 + c * x
    if (v <= 0) continue
    v = v * v * v
    const u = Math.random()
    if (u < 1 - 0.0331 * x * x * x * x) return d * v
    if (Math.log(u) < 0.5 * x * x + d * (1 - v + Math.log(v))) return d * v
  }
}

export function sampleBeta(alpha = 1, beta = 1) {
  const a = sampleGamma(Math.max(0.1, alpha))
  const b = sampleGamma(Math.max(0.1, beta))
  return a / (a + b)
}

export function allocateBanditWeights(arms = [], mode = 'thompson') {
  if (!arms.length) return []
  const totalPulls = Math.max(1, arms.reduce((sum, a) => sum + Number(a.impressions || 1), 0))

  const scored = arms.map(arm => {
    const alpha = 1 + Number(arm.conversions || 0)
    const beta = 1 + Math.max(0, Number(arm.clicks || 0) - Number(arm.conversions || 0))
    const pulls = Math.max(1, Number(arm.impressions || 1))
    const mean = Number(arm.conversions || 0) / pulls
    const ucb = mean + Math.sqrt((2 * Math.log(totalPulls)) / pulls)
    const score = mode === 'ucb1' ? ucb : sampleBeta(alpha, beta)
    return { id: arm.id, name: arm.name, score: Number(score.toFixed(4)) }
  })

  const sumScore = Math.max(1e-6, scored.reduce((s, x) => s + x.score, 0))
  return scored
    .map(x => ({ ...x, weight: Number((x.score / sumScore).toFixed(4)) }))
    .sort((a, b) => b.weight - a.weight)
}
