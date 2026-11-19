/**
 * Trending News Harvester & Viral Remodelling Route Handler (<170 lines)
 * Extracted from server/routes/social-routes.mjs to maintain strict modularity.
 */

import { randomUUID } from 'node:crypto';
import { isOwnerWorkspace } from '../ownerWhitelist.mjs';
import { fetchLiveTrendingNews } from '../marketing/news-harvester.mjs'
import { transformNewsToViralPost } from '../marketing/news-remodeller.mjs'
import { POSTING_RULES, VARIATION_DICTIONARY, generateRandomVariation, getActiveDictionaryElements } from '../marketing/post-dictionary.mjs'
import { VIRAL_FRAMEWORKS, formatWithViralFramework } from '../marketing/viral-frameworks.mjs'
import {
  CONTENT_PILLARS,
  VIRAL_TOPIC_REGISTRY,
  getRandomPillarTopic,
  formatSystemPost
} from '../marketing/content-system.mjs'
import { dbService } from '../db/sqlite-engine.mjs'
import { scanAllDeveloperCommunities, convertSignalToTopic } from '../marketing/community-scanner.mjs'
import { createContentHash, createShortPost, createSourceKey, createTopicKey, isNearDuplicateTopic } from '../marketing/short-post.mjs'
import { findPostMedia } from '../marketing/post-media.mjs'
import { contextKeywords, docIdeaCandidates, projectCandidates, researchPostCandidates } from '../marketing/brand-context.mjs'
import { DEFAULT_BRANDS } from '../marketing/story-generator.mjs'
import { CONTENT_CATEGORIES, getCategoryById, getAllCategories, getCategoriesForBrand } from '../marketing/content-categories.mjs'

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = ''
    let size = 0
    let tooLarge = false
    req.on('data', chunk => {
      if (tooLarge) return
      body += chunk
      size += chunk.length
      if (size > 8192) { tooLarge = true; body = '' }
    })
    req.on('end', () => {
      if (tooLarge) return reject(new Error('Feedback payload is too large.'))
      try { resolve(body ? JSON.parse(body) : {}) } catch { reject(new Error('Invalid JSON.')) }
    })
    req.on('error', reject)
  })
}

function shuffle(items) {
  const result = [...items]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

export async function handleTrendingAndViralRoutes(req, res, url, json) {
  if (url.pathname === '/api/social/random-post-feedback' && req.method === 'POST') {
    try {
      const body = await readJsonBody(req)
      const brandId = String(body.brandId || '')
      const feedback = body.feedback === 'like' ? 1 : body.feedback === 'dislike' ? -1 : 0
      if (!/^[a-z0-9-]{1,64}$/.test(brandId) || !body.draftId || !feedback) {
        return json(res, 400, { error: 'Company, draft, and like/dislike feedback are required.' })
      }
      if (!dbService.setGeneratedDraftFeedback({ id: String(body.draftId), brandId, feedback })) {
        return json(res, 404, { error: 'Draft not found in this company workspace.' })
      }
      return json(res, 200, { success: true, feedback: body.feedback })
    } catch (error) {
      return json(res, 400, { error: error.message || 'Invalid feedback.' })
    }
  }

  if (url.pathname === '/api/social/random-post' && req.method === 'GET') {
    const brandId = String(url.searchParams.get('brandId') || 'danger-labs')
    const brand = /^[a-z0-9-]{1,64}$/.test(brandId)
      ? dbService.getBrandProfile(brandId) || DEFAULT_BRANDS.find(item => item.id === brandId)
      : null
    if (!brand) return json(res, 404, { error: 'Company workspace not found.' })
    const profileText = [brand?.tagline, brand?.purpose?.what, ...(brand?.purpose?.keyThemes || [])].filter(Boolean).join(' ')
    const stopWords = new Set(['with', 'from', 'that', 'this', 'into', 'over', 'have', 'will', 'your', 'about', 'which', 'their'])
    const keywordCounts = new Map()
    for (const word of (profileText.toLowerCase().match(/[a-z0-9]{4,}/g) || []).concat(contextKeywords(brand))) {
      if (!stopWords.has(word)) keywordCounts.set(word, (keywordCounts.get(word) || 0) + 1)
    }
    const rawFocus = String(brand?.purpose?.what || brand?.tagline || 'the work').split(/[.;,]/)[0].trim()
    const focus = rawFocus.length > 36 ? rawFocus.slice(0, 36).replace(/\s+\S*$/, '') : rawFocus || 'systems software'
    let news = { leads: [], isFallback: true }
    try { news = await fetchLiveTrendingNews() } catch {}
    const ranked = (news.leads || []).filter(item => String(item.title || '').trim().length >= 18 && /^https:\/\//.test(item.url || '')).map(item => {
      const text = `${item.title} ${item.summary || ''}`.toLowerCase()
      const relevance = keywords.reduce((count, word) => count + (text.includes(word) ? 1 : 0), 0)
      return { item, relevance, score: Number(item.metrics?.score) || 0 }
    })
    ranked.sort((a, b) => (b.relevance * 1000 + b.score) - (a.relevance * 1000 + a.score))
    const liveRanked = news.isFallback ? [] : ranked
    const relevantLive = shuffle(liveRanked.filter(item => item.relevance > 0)).map(item => ({ lead: item.item, title: item.item.title }))
    const generalLive = shuffle(liveRanked.filter(item => item.relevance === 0).slice(0, 12)).map(item => ({ lead: item.item, title: item.item.title }))
    const projectLane = shuffle(projectCandidates(brand)).map(project => ({ project, lead: null, title: `${project.name} ${project.description}` }))
    const researchLane = shuffle(researchPostCandidates(brand)).map(item => ({ project: null, lead: item.lead, title: item.title }))
    const notesLane = shuffle(docIdeaCandidates(brand)).slice(0, 12).map(title => ({ lead: null, title }))
    const evergreenCandidates = shuffle(getActiveDictionaryElements('hooks')).map(title => ({ lead: null, title }))
    
    // For danger-labs (or workspaces with owned repos), STRICTLY promote owned projects and brand notes.
    // Never leak random Dev.to or external competitor articles into Danger Labs.
    
const isOwner = isOwnerWorkspace(brand);
    const lanes = isOwner && projectLane.length > 0
      ? [projectLane, notesLane].filter(lane => lane.length)
      : shuffle([projectLane, researchLane, relevantLive, notesLane, generalLive]).filter(lane => lane.length)

    const candidates = []
    for (let i = 0; lanes.some(lane => i < lane.length); i++) {
      for (const lane of lanes) if (i < lane.length) candidates.push(lane[i])
    }
    if (!isOwner) candidates.push(...evergreenCandidates)
    const templateStats = dbService.getGeneratedDraftFeedbackStats(brand.id, 'x')
    const previousTopics = dbService.getGeneratedDraftTopics(brand.id, 'x')

    for (const candidate of candidates) {
      if (previousTopics.some(topic => isNearDuplicateTopic(candidate.title, topic))) continue
      const post = createShortPost({ lead: candidate.lead, project: candidate.project, topic: candidate.title, evergreen: !candidate.lead && !candidate.project, focus, templateStats })

      const topicKey = createTopicKey(post.title)
      const sourceKey = createSourceKey(candidate.lead?.url)
      if (dbService.hasGeneratedDraft({ brandId: brand.id, platformId: 'x', topicKey, sourceKey, contentHash: '' })) continue
      const draft = dbService.saveGeneratedDraft({
        id: randomUUID(), brandId: brand.id, platformId: 'x', topicKey, sourceKey,
        contentHash: createContentHash(post.text), topic: post.title, content: post.text,
        source: post.source, sourceUrl: post.sourceUrl, context: post.context, templateId: post.templateId
      })
      if (!draft) continue
      const media = findPostMedia()
      return json(res, 200, {
        success: true, draftId: draft.id, feedback: null, post,
        topic: post.title, source: post.source, context: post.context, media,
        variants: { x: post.text, reddit: post.text, linkedin: post.text, instagram: post.text },
        hashtags: post.hashtags, rules: POSTING_RULES
      })
    }


    return json(res, 409, { error: 'No unseen topics remain. Refresh live trends or add a new evergreen topic.' })
  }

  // Content Categories & Pillars
  if (url.pathname === '/api/social/categories' && req.method === 'GET') {
    const brandId = String(url.searchParams.get('brandId') || 'danger-labs')
    const brand = /^[a-z0-9-]{1,64}$/.test(brandId)
      ? dbService.getBrandProfile(brandId) || DEFAULT_BRANDS.find(item => item.id === brandId)
      : null
    return json(res, 200, {
      success: true,
      brandId,
      categories: getCategoriesForBrand(brandId, brand)
    })
  }

  // 1. Viral & Controversial Tech Topics & GitHub Promo System
  if (url.pathname === '/api/social/viral' || url.pathname === '/api/social/viral-randomize') {
    if (req.method === 'GET') {
      const brandId = String(url.searchParams.get('brandId') || 'danger-labs')
      const brand = /^[a-z0-9-]{1,64}$/.test(brandId)
        ? dbService.getBrandProfile(brandId) || DEFAULT_BRANDS.find(item => item.id === brandId)
        : null
      const brandCategories = getCategoriesForBrand(brandId, brand)
      const categoryId = url.searchParams.get('category') || null
      const selectedCategory = categoryId ? getCategoryById(categoryId, brandId) : null
      const pillar = url.searchParams.get('pillar') || (selectedCategory?.pillar || null)

      let topic
      if (selectedCategory && selectedCategory.topics?.length > 0) {
        const randTopic = selectedCategory.topics[Math.floor(Math.random() * selectedCategory.topics.length)]
        topic = {
          ...randTopic,
          pillar: selectedCategory.pillar,
          category: selectedCategory.id
        }
      } else {
        topic = getRandomPillarTopic(pillar)
      }

      const brandRepos = (brand?.purpose?.repos || []).map(r => r.url.replace(/^https?:\/\//, ''))
      const defaultRepo = selectedCategory?.repoUrl
        ? selectedCategory.repoUrl.replace(/^https?:\/\//, '')
        : (brandRepos.length > 0 ? brandRepos[Math.floor(Math.random() * brandRepos.length)] : 'github.com/dr-week/fast-framework')
      const repo = url.searchParams.get('repo') || defaultRepo
      const platform = url.searchParams.get('platform') || 'x'
      const tags = selectedCategory?.tags || []
      const formatted = formatSystemPost({ topicObj: topic, githubRepo: repo, platform, tags })

      const customTopics = dbService.getAllUserTopics()
      const combinedAllTopics = [...customTopics, ...VIRAL_TOPIC_REGISTRY]
      const media = formatted.media || null

      return json(res, 200, {
        success: true,
        brandId,
        category: selectedCategory,
        topic,
        formatted,
        hook: topic.hook,
        subtext: topic.debate,
        solution: topic.githubSolution,
        repoUrl: `https://${repo.replace(/^https?:\/\//, '')}`,
        pillars: Object.values(CONTENT_PILLARS),
        categories: brandCategories,
        variants: {
          x: formatted.mainPost,
          reddit: formatted.mainPost,
          linkedin: `${topic.hook}\n\n${topic.debate}\n\n${topic.question}\n\n👉 Open-source repo: https://${repo.replace(/^https?:\/\//, '')}\n\n${media?.hashtagString || ''}`
        },
        media: {
          imageUrl: media?.imageUrl || null,
          webLink: media?.webLink || `https://${repo.replace(/^https?:\/\//, '')}`,
          hashtags: media?.hashtags || [],
          hashtagString: media?.hashtagString || ''
        },
        allTopics: combinedAllTopics
      })
    }
    if (req.method === 'POST') {
      let body = ''
      req.on('data', chunk => { body += chunk })
      req.on('end', () => {
        try {
          const parsed = JSON.parse(body || '{}')
          const topic = parsed.topicId
            ? VIRAL_TOPIC_REGISTRY.find(t => t.id === parsed.topicId) || getRandomPillarTopic(parsed.pillar)
            : getRandomPillarTopic(parsed.pillar)
          const repo = parsed.githubRepo || 'github.com/dr-week/fast-framework'
          const formatted = formatSystemPost({
            topicObj: topic,
            githubRepo: repo,
            platform: parsed.platform || 'x'
          })
          return json(res, 200, { success: true, topic, formatted })
        } catch {
          return json(res, 400, { error: 'Failed to generate viral post' })
        }
      })
      return true
    }
  }

  // 2. Developer News Feeds (Hacker News, Lobsters, Dev.to)
  if (url.pathname === '/api/social/news' && req.method === 'GET') {
    const source = url.searchParams.get('source') || null
    try {
      const newsResult = await fetchLiveTrendingNews(source)
      return json(res, 200, newsResult)
    } catch {
      return json(res, 500, { error: 'Failed to harvest developer news' })
    }
  }

  // 3. Transform Tech News into Viral Post & GitHub Promo
  if (url.pathname === '/api/social/news-remodel') {
    let body = ''
    req.on('data', chunk => { body += chunk })
    req.on('end', () => {
      try {
        const parsed = JSON.parse(body || '{}')
        const transformed = transformNewsToViralPost({
          rawTitle: parsed.rawTitle || 'Modern Architecture Shift',
          rawSummary: parsed.rawSummary || '',
          sourceUrl: parsed.sourceUrl || '',
          githubRepo: parsed.githubRepo || 'github.com/dr-week/fast-framework',
          angle: parsed.angle || 'contrarian',
          framework: parsed.framework || 'PAS'
        })
        return json(res, 200, { success: true, ...transformed })
      } catch {
        return json(res, 400, { error: 'Failed to transform news' })
      }
    })
    return true
  }

  // 4. Post Variation Dictionary & Combinatorial Generator
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
    const repo = url.searchParams.get('repo') || 'github.com/dr-week/fast-framework'
    const platform = url.searchParams.get('platform') || 'reddit'
    const targetSubreddit = url.searchParams.get('subreddit') || 'r/webdev'
    const customHook = url.searchParams.get('hook') || null
    const result = generateRandomVariation({ githubRepo: repo, platform, customHook, targetSubreddit })
    return json(res, 200, { success: true, ...result })
  }

  // 5. Multi-Angle Viral Framework Synthesizer
  if (url.pathname === '/api/social/viral-frameworks') {
    if (req.method === 'GET') {
      return json(res, 200, { success: true, frameworks: VIRAL_FRAMEWORKS })
    }
    if (req.method === 'POST') {
      let body = ''
      req.on('data', chunk => { body += chunk })
      req.on('end', () => {
        try {
          const parsed = JSON.parse(body || '{}')
          const formatted = formatWithViralFramework({
            framework: parsed.framework || 'AIDA',
            topic: parsed.topic || 'Zuari (<2.5KB) Architecture Shift',
            rawNotes: parsed.rawNotes || '',
            githubRepo: parsed.githubRepo || 'github.com/dr-week/fast-framework',
            frameworkName: parsed.frameworkName || 'Zuari (@zuari/core)',
            tags: parsed.tags || ['webdev', 'performance', 'architecture', 'opensource']
          })
          return json(res, 200, { success: true, ...formatted })
        } catch {
          return json(res, 400, { error: 'Failed to format with viral framework' })
        }
      })
      return true
    }
  }

  // 6. User Custom & Pending Topics API (Add, List, Delete, Track Status)
  if (url.pathname === '/api/social/custom-topics') {
    if (req.method === 'GET') {
      const allTopics = dbService.getAllUserTopics()
      const pending = dbService.getPendingUserTopics()
      return json(res, 200, {
        success: true,
        topics: allTopics,
        pendingCount: pending.length
      })
    }
    if (req.method === 'POST') {
      let body = ''
      req.on('data', chunk => { body += chunk })
      req.on('end', () => {
        try {
          const parsed = JSON.parse(body || '{}')
          if (!parsed.title && !parsed.hook) {
            return json(res, 400, { error: 'Topic title or hook is required' })
          }
          const saved = dbService.saveUserTopic(parsed)
          return json(res, 201, { success: true, topic: saved })
        } catch (err) {
          return json(res, 400, { error: 'Failed to save custom topic', details: err.message })
        }
      })
      return true
    }
    if (req.method === 'DELETE') {
      const id = url.searchParams.get('id')
      if (!id) return json(res, 400, { error: 'Topic ID is required' })
      const deleted = dbService.deleteUserTopic(id)
      return json(res, 200, { success: deleted, id })
    }
  }

  // 7. Developer Community Scanner API (Reddit, Stack Overflow, Dev.to)
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

  // 8. Viral Feedback Loop & Conversion Rankings API
  if (url.pathname === '/api/social/viral-feedback' && req.method === 'GET') {
    try {
      const { getRankedViralCategories, fetchGitHubRepoMetrics } = await import('../marketing/feedback-loop.mjs')
      const rankings = getRankedViralCategories()
      const gh = await fetchGitHubRepoMetrics()
      return json(res, 200, {
        success: true,
        repo: 'dr-week/fast-framework',
        github: gh,
        rankedCategories: rankings
      })
    } catch (err) {
      return json(res, 500, { error: 'Failed to retrieve feedback rankings', message: err.message })
    }
  }

  return false
}
