const USER_AGENT = 'FollowDesk-BrandResearch/1.0'

export function cleanText(str, len = 200) {
  return String(str || '')
    .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, len)
}

export async function searchHackerNews(query) {
  try {
    const res = await fetch(
      `https://hn.algolia.com/api/v1/search?query=${encodeURIComponent(query)}&tags=story&hitsPerPage=6`,
      { signal: AbortSignal.timeout(5000), headers: { 'User-Agent': USER_AGENT } }
    )
    if (!res.ok) return []
    const data = await res.json()
    return (data.hits || [])
      .map(h => ({
        title: cleanText(h.title, 140),
        url: h.url || `https://news.ycombinator.com/item?id=${h.objectID}`,
        points: Number(h.points) || 0,
        comments: Number(h.num_comments) || 0,
        source: 'Hacker News'
      }))
      .filter(h => h.title.length > 10)
  } catch {
    return []
  }
}

export async function searchDevTo(query) {
  try {
    const res = await fetch(
      `https://dev.to/api/articles?tag=${encodeURIComponent(query)}&per_page=5`,
      { signal: AbortSignal.timeout(5000), headers: { 'User-Agent': USER_AGENT } }
    )
    if (!res.ok) return []
    const data = await res.json()
    if (!Array.isArray(data)) return []
    return data
      .map(item => ({
        title: cleanText(item.title, 140),
        url: item.url,
        reactions: item.positive_reactions_count || 0,
        author: cleanText(item.user?.username || '', 30),
        source: 'Dev.to'
      }))
      .filter(item => item.title.length > 10)
  } catch {
    return []
  }
}

export async function searchGitHubCompetitors(query) {
  try {
    const res = await fetch(
      `https://api.github.com/search/repositories?q=${encodeURIComponent(query)}&sort=stars&order=desc&per_page=5`,
      {
        signal: AbortSignal.timeout(5000),
        headers: { Accept: 'application/vnd.github+json', 'User-Agent': USER_AGENT }
      }
    )
    if (!res.ok) return []
    const data = await res.json()
    return (data.items || [])
      .map(repo => ({
        name: cleanText(repo.full_name, 60),
        description: cleanText(repo.description, 160),
        stars: Number(repo.stargazers_count) || 0,
        url: repo.html_url,
        language: cleanText(repo.language || '', 30)
      }))
      .filter(r => r.name.length > 3)
  } catch {
    return []
  }
}
