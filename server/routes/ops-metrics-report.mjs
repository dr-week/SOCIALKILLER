import { dbService } from '../db/sqlite-engine.mjs'
import { getPostsQueue, getPromoLimitStatus } from '../marketing/orchestrator.mjs'

const score = m => (m.likes || 0) + 2 * (m.replies || 0) + 3 * (m.reposts || 0)

export function buildMetricsReport() {
  const rows = dbService.getMetrics()
  const posts = getPostsQueue()
  const stars = rows.filter(r => r.kind === 'stars' && !r.postId)

  const byPost = new Map()
  for (const r of rows) {
    if (!r.postId) continue
    const cur = byPost.get(r.postId) || {}
    cur[`${r.platformId || 'all'}:${r.kind}`] = r.value
    byPost.set(r.postId, cur)
  }

  const starAt = ts => {
    let last = null
    for (const s of stars) {
      if (Date.parse(s.recordedAt) <= ts) last = s
      else break
    }
    return last
  }

  const perPost = posts.map(p => {
    const raw = byPost.get(p.id) || {}
    const totals = { likes: 0, replies: 0, reposts: 0, views: 0 }
    for (const [k, v] of Object.entries(raw)) {
      const kind = k.split(':')[1]
      if (kind in totals) totals[kind] += v
    }
    const t0 = Date.parse(p.createdAt)
    const base = starAt(t0)
    const later = starAt(t0 + 48 * 3600 * 1000) || stars[stars.length - 1]
    const starDelta = base && later && Date.parse(later.recordedAt) > t0 ? later.value - base.value : null
    return {
      postId: p.id,
      hook: p.topic || p.title,
      createdAt: p.createdAt,
      platforms: p.platforms,
      metrics: totals,
      engagementScore: score(totals),
      starDeltaWithin48h: starDelta
    }
  })

  const ranked = perPost
    .filter(p => p.engagementScore > 0 || p.starDeltaWithin48h)
    .sort((a, b) => (b.engagementScore + (b.starDeltaWithin48h || 0) * 5) - (a.engagementScore + (a.starDeltaWithin48h || 0) * 5))

  return {
    starsTimeline: stars.map(s => ({ at: s.recordedAt, stars: s.value })),
    bestHooks: ranked.slice(0, 5),
    posts: perPost.slice(0, 50),
    promoLimits: getPromoLimitStatus()
  }
}
