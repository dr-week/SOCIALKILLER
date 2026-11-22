/**
 * Autonomous Brand Research & Competitor Intelligence Engine (<150 lines)
 */

import {
  searchDevTo,
  searchGitHubCompetitors,
  searchHackerNews
} from './research/brand-research-feeds.mjs'

export function extractBrandTerms(brand) {
  const purpose = brand?.purpose || {}
  const source = [
    brand?.name,
    brand?.tagline,
    purpose.what,
    ...(purpose.keyThemes || []),
    ...(purpose.repos || []).flatMap(r => [r.name, r.language, ...(r.topics || [])])
  ].filter(Boolean).join(' ')

  const words = source.toLowerCase().match(/[a-z0-9-]{3,}/g) || []
  const stopWords = new Set([
    'with', 'from', 'that', 'this', 'into', 'over', 'have', 'will', 'your',
    'about', 'which', 'their', 'building', 'systems', 'build', 'zero', 'high',
    'developer', 'brand', 'studio', 'creative', 'company', 'engineering', 'india'
  ])

  const counts = new Map()
  for (const w of words) {
    if (!stopWords.has(w) && w.length >= 3) {
      counts.set(w, (counts.get(w) || 0) + 1)
    }
  }

  return [...counts.entries()].sort((a, b) => b[1] - a[1]).map(e => e[0]).slice(0, 5)
}

export function deriveCompetitorAngles(brand, competitors = []) {
  const brandName = brand?.name || 'Our Project'
  const what = brand?.purpose?.what || brand?.tagline || ''
  const angles = []

  if (competitors.length > 0) {
    const topComp = competitors[0]
    angles.push({
      topic: `${brandName} vs ${topComp.name}`,
      angle: `Why traditional solutions like ${topComp.name} (${topComp.description || 'incumbent stack'}) introduce heavy architectural tax, and how ${brandName} solves it.`,
      urgency: 'high'
    })
  }

  if (/framework|vdom|wasm|runtime|webxr|performance/i.test(what)) {
    angles.push(
      {
        topic: 'Virtual DOM & Hydration Tax',
        angle: 'Most modern web frameworks re-execute the entire component tree on hydration. We chose zero-VDOM compiled DOM parts.',
        urgency: 'medium'
      },
      {
        topic: 'Zero-Copy Wasm vs Serialization',
        angle: 'Why JSON serialization kills real-time 120 FPS WebXR and FPV applications. Zero-copy Float64Array memory buffers are the only way.',
        urgency: 'high'
      }
    )
  } else if (/media|creative|cinematic|video|storytelling/i.test(what)) {
    angles.push(
      {
        topic: 'Corporate Agency Monotony',
        angle: 'Tech agency videos all look like slick corporate template reels. Raw founder struggle and gritty terminal sessions outperform polished fluff.',
        urgency: 'high'
      },
      {
        topic: 'Visual Retention Architecture',
        angle: 'First 3 seconds determine whether a developer scrolls away. Breaking down the anatomy of high-retention technical hooks.',
        urgency: 'medium'
      }
    )
  } else {
    angles.push({
      topic: `${brandName} Differentiator`,
      angle: `How ${brandName} cuts through standard market assumptions with a streamlined approach.`,
      urgency: 'medium'
    })
  }

  return angles
}

export async function runBrandResearch(brand) {
  const terms = extractBrandTerms(brand)
  const primaryTerm = terms[0] || brand?.name || 'software'
  const secondaryTerm = terms[1] || 'framework'

  const [hnHits, devtoHits, ghCompetitors] = await Promise.all([
    searchHackerNews(`${primaryTerm} ${secondaryTerm}`).catch(() => []),
    searchDevTo(primaryTerm).catch(() => []),
    searchGitHubCompetitors(primaryTerm).catch(() => [])
  ])

  const trendingDebates = [
    ...hnHits.map(h => ({ title: h.title, url: h.url, source: 'Hacker News', metric: `${h.points} pts / ${h.comments} comments` })),
    ...devtoHits.map(d => ({ title: d.title, url: d.url, source: 'Dev.to', metric: `${d.reactions} reactions` }))
  ].slice(0, 8)

  const competitors = ghCompetitors.map(repo => ({
    name: repo.name,
    description: repo.description,
    stars: repo.stars,
    url: repo.url,
    language: repo.language
  }))

  return {
    researchedAt: new Date().toISOString(),
    searchTerms: terms,
    competitors,
    trendingDebates,
    competitorAngles: deriveCompetitorAngles(brand, competitors),
    summary: `Identified ${competitors.length} relevant ecosystem projects and ${trendingDebates.length} live industry debates matching "${terms.join(', ')}".`
  }
}
