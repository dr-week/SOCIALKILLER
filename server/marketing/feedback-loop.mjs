/**
 * Real GitHub Feedback Loop & Viral Hook Conversion Engine (<140 lines)
 * 
 * Capabilities:
 * 1. Queries live GitHub API metrics (stars, forks, open issues) for dr-week/fast-framework.
 * 2. Computes star deltas across runs.
 * 3. Records conversion scores against post categories in SQLite.
 * 4. Ranks viral hooks by their effectiveness.
 */

import { dbService } from '../db/sqlite-engine.mjs'

const REPO_OWNER = 'dr-week'
const REPO_NAME = 'fast-framework'
const FEEDBACK_STATE_KEY = 'github_feedback_telemetry'

export async function fetchGitHubRepoMetrics(repo = `${REPO_OWNER}/${REPO_NAME}`) {
  try {
    const headers = { 'User-Agent': 'FollowDesk-Growth-Engine' }
    if (process.env.GITHUB_TOKEN) {
      headers.Authorization = `token ${process.env.GITHUB_TOKEN}`
    }
    const res = await fetch(`https://api.github.com/repos/${repo}`, {
      headers,
      signal: AbortSignal.timeout(4000)
    })
    if (!res.ok) {
      return { ok: false, status: res.status, error: `GitHub API error ${res.status}` }
    }
    const data = await res.json()
    return {
      ok: true,
      repo,
      stars: data.stargazers_count ?? 0,
      forks: data.forks_count ?? 0,
      openIssues: data.open_issues_count ?? 0,
      subscribers: data.subscribers_count ?? 0,
      fetchedAt: new Date().toISOString()
    }
  } catch (err) {
    return { ok: false, error: err.message, repo }
  }
}

/**
 * Calculates star delta and records conversion score in SQLite
 */
export async function updateGitHubFeedbackLoop(category = 'General', hook = '') {
  const current = await fetchGitHubRepoMetrics()
  const previous = dbService.getSchedulerState(FEEDBACK_STATE_KEY, { stars: 0, recordedAt: null })

  const starDelta = current.ok && previous.stars !== undefined ? Math.max(0, current.stars - previous.stars) : 0
  const conversionScore = (starDelta * 10) + 1 // Base point for publishing + 10 points per star gained

  if (current.ok) {
    dbService.setSchedulerState(FEEDBACK_STATE_KEY, {
      stars: current.stars,
      forks: current.forks,
      recordedAt: current.fetchedAt,
      lastDelta: starDelta
    })

    // Record metric in SQLite post_metrics table
    try {
      dbService.recordPostMetric({
        postId: `gh-sync-${Date.now().toString(36)}`,
        platformId: 'github',
        kind: 'stars',
        value: current.stars,
        recordedAt: current.fetchedAt
      })
      dbService.recordPostMetric({
        postId: `score-${Date.now().toString(36)}`,
        platformId: category,
        kind: 'conversion_score',
        value: conversionScore,
        recordedAt: current.fetchedAt
      })
    } catch {}
  }

  return {
    stars: current.stars ?? previous.stars,
    starDelta,
    conversionScore,
    category,
    hook,
    timestamp: new Date().toISOString()
  }
}

/**
 * Ranks most effective viral hooks and categories by cumulative conversion scores
 */
export function getRankedViralCategories() {
  const metrics = dbService.getAllPostMetrics()
  const scoreMap = new Map()

  for (const m of metrics) {
    if (m.kind === 'conversion_score') {
      const cat = m.platformId || 'General'
      const current = scoreMap.get(cat) || { category: cat, totalScore: 0, count: 0 }
      current.totalScore += m.value
      current.count += 1
      scoreMap.set(cat, current)
    }
  }

  const list = [...scoreMap.values()].map(item => ({
    ...item,
    averageScore: Math.round(item.totalScore / Math.max(1, item.count))
  }))

  return list.sort((a, b) => b.totalScore - a.totalScore)
}
