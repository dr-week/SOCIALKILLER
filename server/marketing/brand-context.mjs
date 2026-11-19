/**
 * Company context: social links, GitHub repo sync and uploaded notes (.txt/.md).
 * Everything is stored inside brand.purpose so no schema migration is needed, and
 * everything is sanitised because it ends up in public posts.
 */

const MAX_DOCS = 12
const MAX_DOC_CHARS = 20_000
const MAX_LINKS = 20
const GITHUB_USER_RE = /^[A-Za-z0-9](?:[A-Za-z0-9-]{0,38})$/

const LINK_HOSTS = {
  x: ['x.com', 'twitter.com'], linkedin: ['linkedin.com'], github: ['github.com'], reddit: ['reddit.com'],
  instagram: ['instagram.com'], youtube: ['youtube.com', 'youtu.be'], devto: ['dev.to'], hashnode: ['hashnode.com', 'hashnode.dev'],
  medium: ['medium.com'], discord: ['discord.gg', 'discord.com'], website: []
}

function cleanText(value, max) {
  return String(value || '').replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, '').slice(0, max)
}

export function sanitizeLinks(links) {
  const result = []
  const seen = new Set()
  for (const item of Array.isArray(links) ? links : []) {
    const platform = String(item?.platform || 'website').toLowerCase()
    if (!(platform in LINK_HOSTS)) continue
    let url
    try { url = new URL(String(item?.url || '').trim()) } catch { continue }
    if (url.protocol !== 'https:') continue
    const host = url.hostname.replace(/^www\./, '').toLowerCase()
    const allowed = LINK_HOSTS[platform]
    if (allowed.length && !allowed.some(domain => host === domain || host.endsWith(`.${domain}`))) continue
    url.username = ''
    url.password = ''
    const href = url.href.replace(/\/$/, '')
    if (href.length > 200 || seen.has(href)) continue
    seen.add(href)
    result.push({ platform, url: href })
    if (result.length >= MAX_LINKS) break
  }
  return result
}

export function sanitizeDocs(docs) {
  const result = []
  for (const doc of Array.isArray(docs) ? docs : []) {
    const name = cleanText(doc?.name, 80).replace(/[\\/]/g, '_').trim()
    const text = cleanText(doc?.text, MAX_DOC_CHARS).trim()
    if (!name || !/\.(md|markdown|txt)$/i.test(name) || text.length < 20) continue
    result.push({ name, text })
    if (result.length >= MAX_DOCS) break
  }
  return result
}

export function parseGithubUser(value) {
  const raw = String(value || '').trim().replace(/^https?:\/\/(www\.)?github\.com\//i, '').replace(/^@/, '').split(/[/?#]/)[0]
  return GITHUB_USER_RE.test(raw) ? raw : ''
}

async function githubJson(path) {
  const res = await fetch(`https://api.github.com${path}`, {
    signal: AbortSignal.timeout(6000),
    headers: { Accept: 'application/vnd.github+json', 'User-Agent': 'FollowDesk-ContentMachine' }
  })
  if (res.status === 403 || res.status === 429) throw new Error('GitHub rate limit reached. Try again in a few minutes.')
  if (res.status === 404) throw new Error('GitHub user not found.')
  if (!res.ok) throw new Error(`GitHub returned ${res.status}.`)
  return res.json()
}

async function fetchReadmeExcerpt(user, repo) {
  try {
    const res = await fetch(`https://api.github.com/repos/${user}/${repo}/readme`, {
      signal: AbortSignal.timeout(4000),
      headers: { Accept: 'application/vnd.github.raw+json', 'User-Agent': 'FollowDesk-ContentMachine' }
    })
    if (!res.ok) return ''
    const text = (await res.text()).replace(/```[\s\S]*?```/g, '').replace(/!\[[^\]]*\]\([^)]*\)/g, '').replace(/<[^>]+>/g, '')
    const paragraph = text.split(/\n{2,}/).map(p => p.replace(/^#+\s*/gm, '').trim()).find(p => p.length > 60 && !/^\[?!?\[/.test(p))
    return cleanText(paragraph || '', 400)
  } catch { return '' }
}

export async function syncGithubRepos(username) {
  const user = parseGithubUser(username)
  if (!user) throw new Error('Enter a valid GitHub username.')
  const list = await githubJson(`/users/${user}/repos?sort=pushed&per_page=30&type=owner`)
  const repos = list
    .filter(repo => !repo.fork && !repo.archived && !repo.private)
    .slice(0, 12)
    .map(repo => ({
      name: cleanText(repo.name, 80),
      description: cleanText(repo.description, 200),
      language: cleanText(repo.language, 30),
      topics: (repo.topics || []).slice(0, 6).map(topic => cleanText(topic, 30)),
      stars: Number(repo.stargazers_count) || 0,
      url: repo.html_url,
      homepage: /^https:\/\//.test(repo.homepage || '') ? repo.homepage : '',
      pushedAt: repo.pushed_at,
      readme: ''
    }))
  await Promise.all(repos.slice(0, 5).map(async repo => { repo.readme = await fetchReadmeExcerpt(user, repo.name) }))
  return { user, repos, syncedAt: new Date().toISOString() }
}

/** Words describing the company, used to rank live news. */
export function contextKeywords(brand) {
  const purpose = brand?.purpose || {}
  const parts = [
    ...(purpose.repos || []).flatMap(repo => [repo.name, repo.description, repo.language, ...(repo.topics || [])]),
    ...(purpose.docs || []).map(doc => doc.text.slice(0, 1500)),
    ...(purpose.research?.searchTerms || []),
    ...(purpose.research?.competitors || []).map(c => `${c.name} ${c.description}`),
    ...(purpose.research?.trendingDebates || []).map(d => d.title)
  ]
  return parts.join(' ').toLowerCase().match(/[a-z0-9]{4,}/g) || []
}

/** Own-project post candidates, most recently pushed first. */
export function projectCandidates(brand) {
  return (brand?.purpose?.repos || [])
    .filter(repo => repo.description || repo.readme)
    .map(repo => ({ name: repo.name, description: repo.description || repo.readme, url: repo.url, topics: repo.topics, language: repo.language }))
}

/** Short quotable lines from uploaded notes. */
export function docIdeaCandidates(brand) {
  const ideas = []
  for (const doc of brand?.purpose?.docs || []) {
    const text = doc.text.replace(/```[\s\S]*?```/g, ' ').replace(/^#+\s*/gm, '').replace(/[*_`>|]/g, '')
    for (const sentence of text.split(/(?<=[.!?])\s+|\n+/)) {
      const line = sentence.trim().replace(/\s+/g, ' ')
      if (line.length >= 40 && line.length <= 160 && !/https?:\/\//.test(line) && !/^[-\d.\s]*$/.test(line)) ideas.push(line)
    }
  }
  return ideas
}

/** Brand research & competitor debate post candidates. */
export function researchPostCandidates(brand) {
  const research = brand?.purpose?.research
  if (!research) return []
  const candidates = []

  for (const angle of research.competitorAngles || []) {
    candidates.push({
      title: `${angle.topic}: ${angle.angle}`,
      source: 'Competitor Intelligence',
      angle: angle.angle,
      lead: null
    })
  }

  for (const debate of research.trendingDebates || []) {
    candidates.push({
      title: debate.title,
      url: debate.url,
      source: debate.source,
      metric: debate.metric,
      lead: { title: debate.title, url: debate.url, summary: `Community discussion on ${debate.source}: ${debate.metric}` }
    })
  }

  return candidates
}

export function mergeContext(brand, { links, githubUser, docs, github, research }) {
  const purpose = { ...(brand.purpose || {}) }
  if (links !== undefined) purpose.links = sanitizeLinks(links)
  if (docs !== undefined) purpose.docs = sanitizeDocs(docs)
  if (githubUser !== undefined) purpose.githubUser = parseGithubUser(githubUser)
  if (github) {
    purpose.githubUser = github.user
    purpose.repos = github.repos
    purpose.githubSyncedAt = github.syncedAt
  }
  if (research !== undefined) purpose.research = research
  return { ...brand, purpose }
}
