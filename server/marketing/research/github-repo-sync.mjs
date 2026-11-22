import { cleanText, parseGithubUser } from './brand-context-helpers.mjs'

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
