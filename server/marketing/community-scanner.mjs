/**
 * Community Scanner & SDK Integration Engine (<220 lines)
 * 
 * Scans developer communities (Reddit, Stack Overflow, Dev.to, Hacker News)
 * using their official APIs / SDKs to discover authentic trending developer discussions,
 * benchmarks, and high-value technical pain points.
 */

export const COMMUNITY_CHANNELS = {
  STACK_OVERFLOW: 'stackoverflow',
  REDDIT: 'reddit',
  DEVTO: 'devto',
  HACKER_NEWS: 'hackernews'
}

/**
 * Stack Overflow / Stack Exchange API Client (Official REST API v2.3)
 * Fetches hot, high-engagement engineering questions across web, systems, and performance tags.
 */
export async function scanStackOverflow({ tag = 'javascript', minVotes = 10, limit = 5 } = {}) {
  const url = `https://api.stackexchange.com/2.3/questions?pagesize=${limit}&order=desc&sort=hot&tagged=${encodeURIComponent(tag)}&site=stackoverflow&filter=default`
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'FollowDesk-Community-Scanner/1.0' },
      signal: AbortSignal.timeout(4000)
    })
    if (!res.ok) throw new Error(`Stack Overflow API error ${res.status}`)
    const data = await res.json()
    const items = (data.items || []).filter(q => (q.score || 0) >= minVotes || q.answer_count > 0)
    return items.map(q => ({
      id: `so-${q.question_id}`,
      channel: COMMUNITY_CHANNELS.STACK_OVERFLOW,
      title: q.title.replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, '&'),
      url: q.link,
      tags: q.tags || [],
      score: q.score || 0,
      answerCount: q.answer_count || 0,
      summary: `Stack Overflow active discussion (${q.answer_count} answers, ${q.score} votes) on tags: ${(q.tags || []).slice(0, 4).join(', ')}`,
      extractedPillar: q.tags?.some(t => ['rust', 'c++', 'memory', 'performance'].includes(t))
        ? 'Hard Numbers & Benchmarks'
        : 'Future of Coding'
    }))
  } catch (err) {
    return []
  }
}

/**
 * Reddit API Scanner (Official JSON Feeds: r/webdev, r/programming, r/node)
 * Harvests authentic discussions with strict karma and discussion thresholds.
 */
export async function scanRedditSubreddits({ subreddits = ['webdev', 'programming'], limit = 5 } = {}) {
  const results = []
  for (const sub of subreddits) {
    const url = `https://www.reddit.com/r/${encodeURIComponent(sub)}/hot.json?limit=${limit}`
    try {
      const res = await fetch(url, {
        headers: { 'User-Agent': 'FollowDesk-Community-Scanner/1.0 (by /u/developer)' },
        signal: AbortSignal.timeout(4000)
      })
      if (!res.ok) continue
      const data = await res.json()
      const posts = data.data?.children || []
      posts.forEach(p => {
        const d = p.data
        if (!d || d.stickied || d.is_video || d.over_18) return
        if ((d.num_comments || 0) < 3 && (d.score || 0) < 5) return
        results.push({
          id: `reddit-${d.id}`,
          channel: COMMUNITY_CHANNELS.REDDIT,
          subreddit: d.subreddit,
          title: d.title,
          url: `https://reddit.com${d.permalink}`,
          score: d.score,
          commentsCount: d.num_comments,
          selftext: (d.selftext || '').slice(0, 280),
          summary: `r/${d.subreddit} discussion: ${d.title} (${d.num_comments} comments)`,
          extractedPillar: d.subreddit === 'programming' ? 'Industry Controversy' : 'Framework Wars'
        })
      })
    } catch {}
  }
  return results
}

/**
 * Dev.to API Scanner (Official Articles API v0)
 * Scans top technical tutorials and architecture write-ups.
 */
export async function scanDevToArticles({ tag = 'webdev', limit = 5 } = {}) {
  const url = `https://dev.to/api/articles?tag=${encodeURIComponent(tag)}&top=2&per_page=${limit}`
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'FollowDesk-Community-Scanner/1.0' },
      signal: AbortSignal.timeout(4000)
    })
    if (!res.ok) return []
    const articles = await res.json()
    return (articles || []).map(a => ({
      id: `devto-${a.id}`,
      channel: COMMUNITY_CHANNELS.DEVTO,
      title: a.title,
      url: a.url,
      tags: a.tag_list || [],
      score: a.public_reactions_count || 0,
      commentsCount: a.comments_count || 0,
      summary: a.description || `Technical breakdown on ${a.title}`,
      extractedPillar: 'Future of Coding'
    }))
  } catch {
    return []
  }
}

/**
 * Unified Scan: Scans all developer communities in parallel
 * Filters for high signal, removes low-quality noise.
 */
export async function scanAllDeveloperCommunities(options = {}) {
  const [soItems, redditItems, devtoItems] = await Promise.all([
    scanStackOverflow({ tag: options.tag || 'javascript', limit: 4 }),
    scanRedditSubreddits({ subreddits: options.subreddits || ['webdev', 'programming'], limit: 4 }),
    scanDevToArticles({ tag: options.devtoTag || 'webdev', limit: 4 })
  ])

  const combined = [...soItems, ...redditItems, ...devtoItems]
  // Deduplicate and filter out trivial items
  const seenTitles = new Set()
  const filtered = []

  for (const item of combined) {
    const normalized = item.title.toLowerCase().replace(/[^a-z0-9]/g, ' ').trim()
    if (!normalized || seenTitles.has(normalized)) continue
    seenTitles.add(normalized)
    filtered.push(item)
  }

  return {
    scannedAt: new Date().toISOString(),
    totalSignals: filtered.length,
    signals: filtered
  }
}

/**
 * Convert a community discussion signal into a verified non-repetitive topic
 */
export function convertSignalToTopic(signal, githubRepo = 'github.com/dr-week/fast-framework') {
  const cleanTitle = signal.title.replace(/^\[.*?\]\s*/, '').trim()
  return {
    id: `signal-${signal.id}`,
    pillar: signal.extractedPillar || 'Future of Coding',
    hook: `Dev Community Discussion: ${cleanTitle}`,
    debate: signal.summary || `Developers on ${signal.channel} are debating key trade-offs regarding ${cleanTitle}.`,
    question: `How does your team navigate this in production? Have you encountered similar constraints?`,
    githubSolution: `Our open-source engine addresses this by maintaining zero-dependency native execution.`,
    callToAction: `Read the community discussion here: ${signal.url} | Star our repository in replies 👇`,
    sourceUrl: signal.url,
    channel: signal.channel
  }
}
