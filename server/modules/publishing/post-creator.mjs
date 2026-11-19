import { dbService } from '../../db/sqlite-engine.mjs'
import { generateTailoredVariants } from '../../marketing/content-generator.mjs'
import { executePlatformDelivery } from '../../marketing/dispatcher.mjs'
import { PROMO_LIMITS, findDuplicatePost } from '../../marketing/promo-limits.mjs'
import { validatePostQuality } from '../../marketing/content-safety-guard.mjs'
import { getPlatformConfig } from '../../marketing/platform-config.mjs'
import { publishAppEvent } from '../../automation/event-bus.mjs'
import { DEFAULT_BRAND_ID, countRecentDispatches, getPostsQueue, logActivity, pruneStaleDispatches, queueBrowserDispatch } from './post-store.mjs'

const BROWSER_PLATFORMS = ['x', 'reddit', 'linkedin', 'github', 'devto']

export function generateMultiPlatformContent(options = {}) {
  const variants = generateTailoredVariants(options)
  const media = variants._media || null
  return {
    topic: options.topic || 'Shipping Fast & Building in Public',
    tone: options.tone || 'Builder / Authentic',
    generatedAt: new Date().toISOString(),
    variants,
    media: {
      imageUrl: media?.imageUrl || null,
      webLink: media?.webLink || null,
      videoUrl: media?.videoUrl || null,
      hashtags: media?.hashtags || [],
      hashtagString: media?.hashtagString || ''
    }
  }
}

export async function createOrPublishPost(payload) {
  const brandId = payload.brandId || DEFAULT_BRAND_ID
  const title = payload.title || payload.topic || 'Developer Update'
  let platforms = payload.platforms && payload.platforms.length > 0
    ? payload.platforms
    : ['x', 'github', 'devto', 'discord', 'reddit', 'linkedin', 'ai_registry']

  const variants = payload.variants || generateTailoredVariants({
    topic: title,
    rawNotes: payload.rawNotes || '',
    tone: payload.tone || 'Builder / Authentic',
    includeCodeSnippet: payload.includeCodeSnippet !== false,
    tags: payload.tags || ['webdev', 'opensource', 'programming'],
    imageUrl: payload.imageUrl || null,
    webLink: payload.webLink || null,
    videoUrl: payload.videoUrl || null
  })

  const publishNow = Boolean(payload.publishNow)
  const approvalRequired = publishNow || ['autopilot', 'automated_scheduler', 'automated_scheduler_user_topic'].includes(payload.source)
  const shouldDispatchNow = publishNow && !approvalRequired
  if (payload.queueBrowser) return { id: null, title, status: 'rejected_approval_required', message: 'Browser dispatch requires human approval.' }
  pruneStaleDispatches()

  const sourceToken = payload.idempotencyToken || payload.token || null
  const idempotencyToken = sourceToken ? `${brandId}:${sourceToken}` : null
  if (idempotencyToken && dbService.hasIdempotencyToken(idempotencyToken)) {
    return {
      id: null, title, status: 'skipped_duplicate_token', duplicate: true,
      idempotencyToken, message: `Idempotency token "${idempotencyToken}" has already been processed.`
    }
  }

  if (payload.dedupe !== false) {
    const dup = findDuplicatePost(getPostsQueue(brandId), title, variants)
    if (dup) return { ...dup, duplicate: true }
    const qualityCheck = validatePostQuality({
      title, body: variants.x || Object.values(variants)[0] || '', topic: payload.topic || title, webLink: payload.webLink, tags: payload.tags
    })
    if (!qualityCheck.passed) {
      return { id: null, title, status: 'rejected_quality_guard', reason: qualityCheck.reason, conflictingPostId: qualityCheck.conflictingPostId || null }
    }
  }

  const skipped = []
  if (shouldDispatchNow && payload.enforceLimits !== false) {
    platforms = platforms.filter(pId => {
      const lim = PROMO_LIMITS[pId]
      if (lim && countRecentDispatches(pId, brandId) >= lim.max) { skipped.push(pId); return false }
      return true
    })
    if (platforms.length === 0 && skipped.length > 0) {
      for (const pId of skipped) logActivity(pId, 'Skipped (promo limit)', 'skipped', { brandId, message: `Limit reached for ${pId}` })
      return { id: null, title, status: 'skipped_limit', skippedPlatforms: skipped, platforms: [], variants, deliveryLogs: [] }
    }
  }

  const media = variants._media || null
  const newPost = {
    id: `post-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
    brandId, title, topic: payload.topic || title, contentType: payload.contentType || 'multi_channel', platforms,
    status: payload.status === 'draft' ? 'draft' : (approvalRequired ? 'pending_approval' : 'scheduled'),
    approvalStatus: payload.status === 'draft' ? 'not_required' : (approvalRequired ? 'pending' : 'not_required'),
    scheduledAt: payload.scheduledAt || new Date(Date.now() + 3600 * 1000).toISOString(),
    createdAt: new Date().toISOString(), variants, deliveryLogs: [],
    imageUrl: payload.imageUrl || media?.imageUrl || null, webLink: payload.webLink || media?.webLink || null,
    videoUrl: payload.videoUrl || media?.videoUrl || null, hashtags: media?.hashtags || []
  }
  for (const pId of skipped) newPost.deliveryLogs.push({ platformId: pId, kind: 'skipped_limit', at: new Date().toISOString() })

  if (shouldDispatchNow) {
    for (const pId of platforms) {
      const text = variants[pId] || variants.x || title
      const cfg = { ...getPlatformConfig(brandId, pId), imageUrl: newPost.imageUrl, videoUrl: newPost.videoUrl }
      const res = await executePlatformDelivery(pId, text, title, cfg)
      newPost.deliveryLogs.push({ ...res, platformId: pId, kind: 'dispatched', at: new Date().toISOString() })
      if (BROWSER_PLATFORMS.includes(pId) && payload.queueBrowser) {
        queueBrowserDispatch(newPost, pId, title, text, res.intentUrl, payload.autoClickSubmit === true)
      }
      logActivity(pId, 'Publish Post', res.success ? 'success' : 'failed', { brandId, mode: res.mode, intentUrl: res.intentUrl, externalUrl: res.externalUrl, message: res.message })
    }
  }

  dbService.savePost(newPost)
  if (idempotencyToken) {
    dbService.recordIdempotencyToken({
      token: idempotencyToken, scope: 'broadcast', source: payload.source || 'local',
      metadata: { postId: newPost.id, title: newPost.title, platforms: newPost.platforms }
    })
  }
  const topicId = payload.topicId || (payload.topicObj && payload.topicObj.id)
  if (topicId) { try { dbService.markUserTopicUsed(topicId, 'used') } catch {} }

  if (payload.source !== 'automation') {
    void publishAppEvent({
      type: 'social.post.created', id: `social.post.created:${newPost.id}`, brandId,
      payload: { source: payload.source || 'manual', status: newPost.status, platformId: newPost.platforms[0] || '', title: newPost.title }
    }).catch(error => console.error(`Automation event dispatch failed: ${error.message}`))
  }
  return newPost
}
