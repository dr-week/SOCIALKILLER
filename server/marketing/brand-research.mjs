/**
 * Autonomous Brand Research & Competitor Intelligence Engine
 * Queries live developer & industry feeds (Hacker News Algolia API, Dev.to API, GitHub Search API)
 * dynamically tailored to the specific company's description, keywords, and domain.
 * Discovers competitors, market debates, and industry signals without requiring paid API keys.
 */

const USER_AGENT = 'FollowDesk-BrandResearch/1.0'

function clean(str, len = 200) {
  return String(str || '')
    .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, len)
}

/**
 * Extract clean query terms from company profile
 */
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

  // Pick top 5 most salient terms
  const sorted = [...counts.entries()].sort((a, b) => b[1] - a[1]).map(e => e[0])
  return sorted.slice(0, 5)
}

/**
 * Query Hacker News Algolia API for recent discussions matching company domain
 */
async function searchHackerNews(query) {
  try {
    const res = await fetch(`https://hn.algolia.com/api/v1/search?query=${encodeURIComponent(query)}&tags=story&hitsPerPage=6`, {
      signal: AbortSignal.timeout(5000),
      headers: { 'User-Agent': USER_AGENT }
    })
    if (!res.ok) return []
    const data = await res.json()
    return (data.hits || []).map(h => ({
      title: clean(h.title, 140),
      url: h.url || `https://news.ycombinator.com/item?id=${h.objectID}`,
      points: Number(h.points) || 0,
      comments: Number(h.num_comments) || 0,
      source: 'Hacker News'
    })).filter(h => h.title.length > 10)
  } catch {
    return []
  }
}

/**
 * Query Dev.to API for articles matching company tag / query
 */
async function searchDevTo(query) {
  try {
    const res = await fetch(`https://dev.to/api/articles?tag=${encodeURIComponent(query)}&per_page=5`, {
      signal: AbortSignal.timeout(5000),
      headers: { 'User-Agent': USER_AGENT }
    })
    if (!res.ok) return []
    const data = await res.json()
    if (!Array.isArray(data)) return []
    return data.map(item => ({
      title: clean(item.title, 140),
      url: item.url,
      reactions: item.positive_reactions_count || 0,
      author: clean(item.user?.username || '', 30),
      source: 'Dev.to'
    })).filter(item => item.title.length > 10)
  } catch {
    return []
  }
}

/**
 * Query GitHub Search API for popular repositories in this field (to identify competitors & peers)
 */
async function searchGitHubCompetitors(query) {
  try {
    const res = await fetch(`https://api.github.com/search/repositories?q=${encodeURIComponent(query)}&sort=stars&order=desc&per_page=5`, {
      signal: AbortSignal.timeout(5000),
      headers: {
        Accept: 'application/vnd.github+json',
        'User-Agent': USER_AGENT
      }
    })
    if (!res.ok) return []
    const data = await res.json()
    return (data.items || []).map(repo => ({
      name: clean(repo.full_name, 60),
      description: clean(repo.description, 160),
      stars: Number(repo.stargazers_count) || 0,
      url: repo.html_url,
      language: clean(repo.language || '', 30)
    })).filter(r => r.name.length > 3)
  } catch {
    return []
  }
}

/**
 * Derive company-specific competitor angles and debate prompts based on company positioning
 */
export function deriveCompetitorAngles(brand, competitors = []) {
  const brandName = brand?.name || 'Our Project'
  const what = brand?.purpose?.what || brand?.tagline || ''
  const tone = brand?.purpose?.toneOfVoice || ''

  const angles = []

  if (competitors.length > 0) {
    const topComp = competitors[0]
    angles.push({
      topic: `${brandName} vs ${topComp.name}`,
      angle: `Why traditional solutions like ${topComp.name} (${topComp.description || 'incumbent stack'}) introduce heavy architectural tax, and how ${brandName} solves it.`,
      urgency: 'high'
    })
  }

  // Domain-specific contrast points
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

/**
 * Autonomous Research Runner for a Company Profile
 * Runs non-blocking network searches and synthesizes a full competitor/intel report.
 */
export async function runBrandResearch(brand) {
  const terms = extractBrandTerms(brand)
  const primaryTerm = terms[0] || brand?.name || 'software'
  const secondaryTerm = terms[1] || 'framework'

  // Run searches concurrently with safety timeouts
  const [hnHits, devtoHits, ghCompetitors] = await Promise.all([
    searchHackerNews(`${primaryTerm} ${secondaryTerm}`).catch(() => []),
    searchDevTo(primaryTerm).catch(() => []),
    searchGitHubCompetitors(primaryTerm).catch(() => [])
  ])

  // Synthesize market debates
  const trendingDebates = [
    ...hnHits.map(h => ({ title: h.title, url: h.url, source: 'Hacker News', metric: `${h.points} pts / ${h.comments} comments` })),
    ...devtoHits.map(d => ({ title: d.title, url: d.url, source: 'Dev.to', metric: `${d.reactions} reactions` }))
  ].slice(0, 8)

  // Map competitors
  const competitors = ghCompetitors.map(repo => ({
    name: repo.name,
    description: repo.description,
    stars: repo.stars,
    url: repo.url,
    language: repo.language
  }))

  const competitorAngles = deriveCompetitorAngles(brand, competitors)

  return {
    researchedAt: new Date().toISOString(),
    searchTerms: terms,
    competitors,
    trendingDebates,
    competitorAngles,
    summary: `Identified ${competitors.length} relevant ecosystem projects and ${trendingDebates.length} live industry debates matching "${terms.join(', ')}".`
  }
}
