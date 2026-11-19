import { readJsonBody } from '../http/read-json.mjs'
import { POSTING_RULES, VARIATION_DICTIONARY, generateRandomVariation } from '../marketing/post-dictionary.mjs'
import { VIRAL_FRAMEWORKS, formatWithViralFramework } from '../marketing/viral-frameworks.mjs'
import { VIRAL_TOPIC_REGISTRY } from '../marketing/content-system.mjs'
import { dbService } from '../db/sqlite-engine.mjs'
import { scanAllDeveloperCommunities } from '../marketing/community-scanner.mjs'
import { handleRandomPostRoutes } from './viral-random-post-route.mjs'
import { handleViralTopicsRoutes } from './viral-topics-routes.mjs'

const DEFAULT_REPO = 'github.com/dr-week/fast-framework'

export async function handleTrendingAndViralRoutes(req, res, url, json) {
  if (await handleRandomPostRoutes(req, res, url, json)) return true
  if (await handleViralTopicsRoutes(req, res, url, json)) return true

  if (url.pathname === '/api/social/dictionary' && req.method === 'GET') {
    const dynamicItems = dbService.getAllDictionaryItems()
    return json(res, 200, {
      success: true,
      dictionary: VARIATION_DICTIONARY,
      postingRules: POSTING_RULES,
      dynamicItems,
      dynamicCount: dynamicItems.length
    })
  }

  if ((url.pathname === '/api/social/random-variation' || url.pathname === '/api/social/variations') && req.method === 'GET') {
    const repo = url.searchParams.get('repo') || DEFAULT_REPO
    const platform = url.searchParams.get('platform') || 'reddit'
    const targetSubreddit = url.searchParams.get('subreddit') || 'r/webdev'
    const customHook = url.searchParams.get('hook') || null
    const result = generateRandomVariation({ githubRepo: repo, platform, customHook, targetSubreddit })
    return json(res, 200, { success: true, ...result })
  }

  if (url.pathname === '/api/social/viral-frameworks') {
    if (req.method === 'GET') {
      return json(res, 200, { success: true, frameworks: VIRAL_FRAMEWORKS })
    }
    if (req.method === 'POST') {
      try {
        const parsed = await readJsonBody(req)
        const formatted = formatWithViralFramework({
          framework: parsed.framework || 'AIDA',
          topic: parsed.topic || 'Zuari (<2.5KB) Architecture Shift',
          rawNotes: parsed.rawNotes || '',
          githubRepo: parsed.githubRepo || DEFAULT_REPO,
          frameworkName: parsed.frameworkName || 'Zuari (@zuari/core)',
          tags: parsed.tags || ['webdev', 'performance', 'architecture', 'opensource']
        })
        return json(res, 200, { success: true, ...formatted })
      } catch (err) {
        return json(res, err.statusCode || 400, { error: 'Failed to format with viral framework' })
      }
    }
  }

  if (url.pathname === '/api/social/custom-topics') {
    if (req.method === 'GET') {
      const allTopics = dbService.getAllUserTopics()
      const pending = dbService.getPendingUserTopics()
      return json(res, 200, { success: true, topics: allTopics, pendingCount: pending.length })
    }
    if (req.method === 'POST') {
      try {
        const parsed = await readJsonBody(req)
        if (!parsed.title && !parsed.hook) return json(res, 400, { error: 'Topic title or hook is required' })
        return json(res, 201, { success: true, topic: dbService.saveUserTopic(parsed) })
      } catch (err) {
        return json(res, err.statusCode || 400, { error: 'Failed to save custom topic', details: err.message })
      }
    }
    if (req.method === 'DELETE') {
      const id = url.searchParams.get('id')
      if (!id) return json(res, 400, { error: 'Topic ID is required' })
      return json(res, 200, { success: dbService.deleteUserTopic(id), id })
    }
  }

  if (url.pathname === '/api/social/community-scan' && req.method === 'GET') {
    try {
      const tag = url.searchParams.get('tag') || 'javascript'
      const scan = await scanAllDeveloperCommunities({ tag })
      const { ingestCommunitySignalsToDictionary } = await import('../marketing/post-dictionary.mjs')
      const ingestion = ingestCommunitySignalsToDictionary(scan.signals || [])
      return json(res, 200, { success: true, ...scan, ingestion })
    } catch (err) {
      return json(res, 500, { error: 'Failed to scan developer communities', message: err.message })
    }
  }

  if (url.pathname === '/api/social/viral-feedback' && req.method === 'GET') {
    try {
      const { getRankedViralCategories, fetchGitHubRepoMetrics } = await import('../marketing/feedback-loop.mjs')
      return json(res, 200, {
        success: true,
        repo: 'dr-week/fast-framework',
        github: await fetchGitHubRepoMetrics(),
        rankedCategories: getRankedViralCategories()
      })
    } catch (err) {
      return json(res, 500, { error: 'Failed to retrieve feedback rankings', message: err.message })
    }
  }

  void VIRAL_TOPIC_REGISTRY
  return false
}
