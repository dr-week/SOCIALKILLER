/**
 * News Harvester & Trend Synthesizer (<220 lines)
 * 
 * Fetches real-time trending items from Hacker News, Lobsters, and Dev.to,
 * and falls back to curated industry leads when offline.
 */
import { NEWS_SOURCES, normalizeRawLead } from './sources-registry.mjs'

const FALLBACK_TRENDING_LEADS = [
  {
    sourceId: 'hn',
    title: 'Why SQLite is replacing Postgres for local-first and edge architectures',
    url: 'https://news.ycombinator.com/item?id=38910231',
    summary: 'Discussion on embedded databases, zero network overhead, and moving compute closer to user memory.',
    score: 412,
    commentsCount: 285
  },
  {
    sourceId: 'lobsters',
    title: 'Virtual DOM overhead benchmarked on modern 120Hz displays',
    url: 'https://lobste.rs/s/vdom-bench',
    summary: 'Detailed performance profile proving direct signal graphs and DOM parts eliminate frame drops on high refresh displays.',
    score: 188,
    commentsCount: 94
  },
  {
    sourceId: 'devto',
    title: 'The shift from Full-Stack to AI Systems Architecture in 2026',
    url: 'https://dev.to/t/webdev/future-coding-2026',
    summary: 'Why developers are abandoning boilerplate code writing and focusing on verified schemas, Wasm FFI, and local-first pipelines.',
    score: 320,
    commentsCount: 142
  },
  {
    sourceId: 'hn',
    title: 'Show HN: Selling Software Directly to AI Agents with llms.txt and MCP',
    url: 'https://news.ycombinator.com/item?id=39102481',
    summary: 'Exposing machine-readable schemas and tools so autonomous agents purchase and integrate developer libraries directly.',
    score: 520,
    commentsCount: 310
  }
]

export async function fetchLiveTrendingNews(sourceKey = null) {
  const leads = []
  let isFallback = false

  // Try Dev.to API
  if (!sourceKey || sourceKey === 'devto') {
    try {
      const res = await fetch('https://dev.to/api/articles?top=1&per_page=6', { signal: AbortSignal.timeout(3000) })
      if (res.ok) {
        const articles = await res.json()
        articles.forEach(art => {
          leads.push(normalizeRawLead({
            sourceId: 'devto',
            title: art.title,
            url: art.url,
            summary: art.description || art.readable_publish_date,
            score: art.public_reactions_count || 100,
            commentsCount: art.comments_count || 10
          }))
        })
      }
    } catch {}
  }

  // Try Lobsters JSON API
  if (!sourceKey || sourceKey === 'lobsters') {
    try {
      const res = await fetch('https://lobste.rs/hottest.json', { signal: AbortSignal.timeout(3000) })
      if (res.ok) {
        const stories = await res.json()
        stories.slice(0, 6).forEach(st => {
          leads.push(normalizeRawLead({
            sourceId: 'lobsters',
            title: st.title,
            url: st.url || st.short_id_url,
            summary: st.description || `Lobsters discussion tagged: ${(st.tags || []).join(', ')}`,
            score: st.score || 50,
            commentsCount: st.comment_count || 5
          }))
        })
      }
    } catch {}
  }

  // Try Hacker News API
  if (!sourceKey || sourceKey === 'hn') {
    try {
      const topRes = await fetch('https://hacker-news.firebaseio.com/v0/topstories.json', { signal: AbortSignal.timeout(3000) })
      if (topRes.ok) {
        const ids = (await topRes.json()).slice(0, 15)
        const items = await Promise.all(
          ids.map(id =>
            fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`, { signal: AbortSignal.timeout(2000) })
              .then(r => r.json())
              .catch(() => null)
          )
        )
        items.filter(Boolean).forEach(it => {
          leads.push(normalizeRawLead({
            sourceId: 'hn',
            title: it.title,
            url: it.url || `https://news.ycombinator.com/item?id=${it.id}`,
            summary: `Hacker News Top Story by ${it.by}`,
            score: it.score || 100,
            commentsCount: it.descendants || 20
          }))
        })
      }
    } catch {}
  }

  // Fallback to high-signal curated items if offline or rate-limited
  if (leads.length === 0) {
    isFallback = true
    FALLBACK_TRENDING_LEADS.forEach(fl => {
      leads.push(normalizeRawLead(fl))
    })
  }

  return {
    success: true,
    count: leads.length,
    isFallback,
    sources: NEWS_SOURCES.map(s => ({ id: s.id, name: s.name, category: s.category })),
    leads
  }
}
