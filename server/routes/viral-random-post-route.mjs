import { randomUUID } from 'node:crypto'
import { isOwnerWorkspace } from '../ownerWhitelist.mjs'
import { readJsonBody } from '../http/read-json.mjs'
import { fetchLiveTrendingNews } from '../marketing/news-harvester.mjs'
import { POSTING_RULES, getActiveDictionaryElements } from '../marketing/post-dictionary.mjs'
import { dbService } from '../db/sqlite-engine.mjs'
import { createContentHash, createShortPost, createSourceKey, createTopicKey, isNearDuplicateTopic } from '../marketing/short-post.mjs'
import { findPostMedia } from '../marketing/post-media.mjs'
import { contextKeywords, docIdeaCandidates, projectCandidates, researchPostCandidates } from '../marketing/brand-context.mjs'
import { DEFAULT_BRANDS } from '../marketing/story-generator.mjs'

const BRAND_ID_RE = /^[a-z0-9-]{1,64}$/
const STOP_WORDS = new Set(['with', 'from', 'that', 'this', 'into', 'over', 'have', 'will', 'your', 'about', 'which', 'their'])

function shuffle(items) {
  const result = [...items]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

export async function handleRandomPostRoutes(req, res, url, json) {
  if (url.pathname === '/api/social/random-post-feedback' && req.method === 'POST') {
    try {
      const body = await readJsonBody(req, 8192)
      const brandId = String(body.brandId || '')
      const feedback = body.feedback === 'like' ? 1 : body.feedback === 'dislike' ? -1 : 0
      if (!BRAND_ID_RE.test(brandId) || !body.draftId || !feedback) {
        return json(res, 400, { error: 'Company, draft, and like/dislike feedback are required.' })
      }
      if (!dbService.setGeneratedDraftFeedback({ id: String(body.draftId), brandId, feedback })) {
        return json(res, 404, { error: 'Draft not found in this company workspace.' })
      }
      return json(res, 200, { success: true, feedback: body.feedback })
    } catch (error) {
      return json(res, error.statusCode || 400, { error: error.message || 'Invalid feedback.' })
    }
  }

  if (url.pathname !== '/api/social/random-post' || req.method !== 'GET') return false

  const brandId = String(url.searchParams.get('brandId') || 'danger-labs')
  const brand = BRAND_ID_RE.test(brandId)
    ? dbService.getBrandProfile(brandId) || DEFAULT_BRANDS.find(item => item.id === brandId)
    : null
  if (!brand) return json(res, 404, { error: 'Company workspace not found.' })

  const profileText = [brand?.tagline, brand?.purpose?.what, ...(brand?.purpose?.keyThemes || [])].filter(Boolean).join(' ')
  const keywordCounts = new Map()
  for (const word of (profileText.toLowerCase().match(/[a-z0-9]{4,}/g) || []).concat(contextKeywords(brand))) {
    if (!STOP_WORDS.has(word)) keywordCounts.set(word, (keywordCounts.get(word) || 0) + 1)
  }
  const keywords = [...keywordCounts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 12).map(([word]) => word)
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

  const isOwner = isOwnerWorkspace(brand)
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
    return json(res, 200, {
      success: true, draftId: draft.id, feedback: null, post,
      topic: post.title, source: post.source, context: post.context, media: findPostMedia(),
      variants: { x: post.text, reddit: post.text, linkedin: post.text, instagram: post.text },
      hashtags: post.hashtags, rules: POSTING_RULES
    })
  }
  return json(res, 409, { error: 'No unseen topics remain. Refresh live trends or add a new evergreen topic.' })
}
