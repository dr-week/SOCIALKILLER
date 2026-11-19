/**
 * Omni-Channel Social Media Manager, Automated Publisher & Account Keep-Alive Orchestrator (<220 lines)
 * 
 * Cleanly delegates to modular sub-services:
 * - platforms.mjs (Supported platform schemas)
 * - content-generator.mjs (Tailored content creation)
 * - dispatcher.mjs (Live API execution & intent dispatch)
 * - projects-catalog.mjs (Tracked projects and AI discovery feeds)
 * - lyra-copywriter.mjs (Lyra multi-framework copywriting)
 * - market-intel.mjs (Competitive positioning & benchmarks)
 * - promo-limits.mjs (Deduplication & promo frequency limits)
 * - keep-alive-pulse.mjs (Heartbeat pulses & account keep-alive streaks)
 */
import { SUPPORTED_PLATFORMS } from './platforms.mjs'
import { generateTailoredVariants } from './content-generator.mjs'
import { executePlatformDelivery } from './dispatcher.mjs'
import { getTrackedProjects, addTrackedProject, getAiFeedLlmText, getAiFeedCatalogJson } from './projects-catalog.mjs'
import { runLyraCopywriter, generateMeetingPromo, generateAdCampaigns, LYRA_FRAMEWORKS } from './lyra-copywriter.mjs'
import { getMarketAnalysisReport } from './market-intel.mjs'
import { generateRssFeedXml } from './rss-feed.mjs'
import { dbService } from '../db/sqlite-engine.mjs'
import {
  PROMO_LIMITS,
  DAY_MS,
  STALE_DISPATCH_MS,
  findDuplicatePost,
  countRecentDispatches as _countRecentDispatches,
  getPromoLimitStatus as _getPromoLimitStatus
} from './promo-limits.mjs'
import { executeKeepAlivePulse } from './keep-alive-pulse.mjs'
import { validatePostQuality } from './content-safety-guard.mjs'
import { normalizeQueuedPost } from './post-queue-normalizer.mjs'
import { getPlatformConfig, getPlatformsStatus as getConfiguredPlatformStatuses, updatePlatformConfig } from './platform-config.mjs'
import { publishAppEvent } from '../automation/event-bus.mjs'

export {
  SUPPORTED_PLATFORMS,
  LYRA_FRAMEWORKS,
  runLyraCopywriter,
  generateMeetingPromo,
  generateAdCampaigns,
  getMarketAnalysisReport,
  generateRssFeedXml,
  getTrackedProjects,
  addTrackedProject,
  getAiFeedLlmText,
  getAiFeedCatalogJson,
  PROMO_LIMITS
}

// In-Memory state hydrated from SQLite
const postQueue = dbService.getAllPosts().map(normalizeQueuedPost)
const activityLogs = dbService.getActivityLogs()
const pendingBrowserDispatches = dbService.getPendingDispatches()
const DEFAULT_BRAND_ID = 'danger-labs'

export const getPlatformsStatus = (brandId = DEFAULT_BRAND_ID) =>
  getConfiguredPlatformStatuses(brandId, SUPPORTED_PLATFORMS)
export { updatePlatformConfig }

export function getPendingBrowserDispatches() {
  return pendingBrowserDispatches
}

export function pushPendingBrowserDispatch(dispatch) {
  if (!dispatch || !dispatch.id) return null
  dbService.pushDispatch(dispatch)
  pendingBrowserDispatches.push(dispatch)
  return dispatch
}

export function popPendingBrowserDispatch(id) {
  const popped = dbService.popDispatch(id)
  const idx = pendingBrowserDispatches.findIndex(d => (id ? d.id === id : true))
  if (idx !== -1) {
    pendingBrowserDispatches.splice(idx, 1)
  }
  return popped || null
}

export function getPostsQueue(brandId = null) {
  return brandId ? postQueue.filter(post => post.brandId === brandId) : postQueue
}

export function getSocialActivityLogs(brandId = null) {
  return brandId ? activityLogs.filter(log => (log.brandId || DEFAULT_BRAND_ID) === brandId) : activityLogs
}

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

const BROWSER_PLATFORMS = ['x', 'reddit', 'linkedin', 'github', 'devto']

export function countRecentDispatches(platformId, brandId = null) {
  const posts = brandId ? postQueue.filter(post => post.brandId === brandId) : postQueue
  return _countRecentDispatches(posts, platformId)
}

export function getPromoLimitStatus() {
  return _getPromoLimitStatus(postQueue)
}

/** Drops browser dispatches nobody picked up within 24h so they never fire at a surprising later time. */
export function pruneStaleDispatches() {
  const now = Date.now()
  let removed = 0
  for (const d of [...pendingBrowserDispatches]) {
    if (now - Date.parse(d.queuedAt) > STALE_DISPATCH_MS) {
      popPendingBrowserDispatch(d.id)
      removed++
    }
  }
  return removed
}

function queueBrowserDispatch(post, pId, title, text, intentUrl, autoClickSubmit) {
  const dispItem = {
    id: `disp-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 5)}-${pId}`,
    postId: post.id,
    platformId: pId,
    title,
    content: text,
    intentUrl: intentUrl || null,
    autoClickSubmit,
    queuedAt: new Date().toISOString()
  }
  dbService.pushDispatch(dispItem)
  pendingBrowserDispatches.push(dispItem)
}

export function logActivity(pId, action, status, extra = {}) {
  const brandId = extra.brandId || DEFAULT_BRAND_ID
  const logItem = {
    id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 5)}-${pId}`,
    timestamp: new Date().toISOString(),
    platformId: pId,
    brandId,
    action,
    status,
    ...extra
  }
  dbService.addActivityLog(logItem)
  activityLogs.unshift(logItem)
  if (activityLogs.length > 150) activityLogs.length = 150
  return logItem
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
  // Automated sources may generate content, but can never authorize dispatch.
  const approvalRequired = publishNow || ['autopilot', 'automated_scheduler', 'automated_scheduler_user_topic'].includes(payload.source)
  const shouldDispatchNow = publishNow && !approvalRequired
  const queueBrowser = Boolean(payload.queueBrowser)
  if (queueBrowser) return { id: null, title, status: 'rejected_approval_required', message: 'Browser dispatch requires human approval.' }
  pruneStaleDispatches()

  // 0. Idempotency Token Enforcement
  const sourceToken = payload.idempotencyToken || payload.token || null
  const idempotencyToken = sourceToken ? `${brandId}:${sourceToken}` : null
  if (idempotencyToken) {
    if (dbService.hasIdempotencyToken(idempotencyToken)) {
      return {
        id: null,
        title,
        status: 'skipped_duplicate_token',
        duplicate: true,
        idempotencyToken,
        message: `Idempotency token "${idempotencyToken}" has already been processed.`
      }
    }
  }

  // 1. Dedupe & Content Quality Check
  if (payload.dedupe !== false) {
    const dup = findDuplicatePost(postQueue.filter(post => post.brandId === brandId), title, variants)
    if (dup) return { ...dup, duplicate: true }

    const qualityCheck = validatePostQuality({
      title,
      body: variants.x || Object.values(variants)[0] || '',
      topic: payload.topic || title,
      webLink: payload.webLink,
      tags: payload.tags
    })
    if (!qualityCheck.passed) {
      return {
        id: null,
        title,
        status: 'rejected_quality_guard',
        reason: qualityCheck.reason,
        conflictingPostId: qualityCheck.conflictingPostId || null
      }
    }
  }

  // 2. Promo limits only gate real dispatches (publishNow / queueBrowser), not drafts.
  const skipped = []
  if ((shouldDispatchNow || (!approvalRequired && queueBrowser)) && payload.enforceLimits !== false) {
    platforms = platforms.filter(pId => {
      const lim = PROMO_LIMITS[pId]
      if (lim && countRecentDispatches(pId, brandId) >= lim.max) {
        skipped.push(pId)
        return false
      }
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
    brandId,
    title,
    topic: payload.topic || title,
    contentType: payload.contentType || 'multi_channel',
    platforms,
    status: payload.status === 'draft' ? 'draft' : (approvalRequired ? 'pending_approval' : 'scheduled'),
    approvalStatus: payload.status === 'draft' ? 'not_required' : (approvalRequired ? 'pending' : 'not_required'),
    scheduledAt: payload.scheduledAt || new Date(Date.now() + 3600 * 1000).toISOString(),
    createdAt: new Date().toISOString(),
    variants,
    deliveryLogs: [],
    imageUrl: payload.imageUrl || media?.imageUrl || null,
    webLink: payload.webLink || media?.webLink || null,
    videoUrl: payload.videoUrl || media?.videoUrl || null,
    hashtags: media?.hashtags || []
  }
  for (const pId of skipped) {
    newPost.deliveryLogs.push({ platformId: pId, kind: 'skipped_limit', at: new Date().toISOString() })
  }

  if (shouldDispatchNow) {
    for (const pId of platforms) {
      const text = variants[pId] || variants.x || title
      const cfg = { ...getPlatformConfig(brandId, pId), imageUrl: newPost.imageUrl, videoUrl: newPost.videoUrl }
      const res = await executePlatformDelivery(pId, text, title, cfg)
      newPost.deliveryLogs.push({ ...res, platformId: pId, kind: 'dispatched', at: new Date().toISOString() })

      // Browser-assisted platforms get queued ONLY if explicitly requested (queueBrowser = true)
      if (BROWSER_PLATFORMS.includes(pId) && queueBrowser) {
        queueBrowserDispatch(newPost, pId, title, text, res.intentUrl, payload.autoClickSubmit === true)
      }
      logActivity(pId, 'Publish Post', res.success ? 'success' : 'failed', { brandId,
        mode: res.mode, intentUrl: res.intentUrl, externalUrl: res.externalUrl, message: res.message
      })
    }
  } else if (queueBrowser) {
    // Hands-free mode: queue composer fills for the extension, publish nothing server-side.
    for (const pId of platforms) {
      if (!BROWSER_PLATFORMS.includes(pId)) continue
      const text = variants[pId] || variants.x || title
      queueBrowserDispatch(newPost, pId, title, text, null, payload.autoClickSubmit === true)
      newPost.deliveryLogs.push({ platformId: pId, kind: 'dispatched', mode: 'browser_queue', at: new Date().toISOString() })
      logActivity(pId, 'Queued for browser fill', 'success', { brandId, mode: 'browser_queue', message: `Queued ${pId} composer fill` })
    }
  }

  dbService.savePost(newPost)
  if (idempotencyToken) {
    dbService.recordIdempotencyToken({
      token: idempotencyToken,
      scope: 'broadcast',
      source: payload.source || 'local',
      metadata: { postId: newPost.id, title: newPost.title, platforms: newPost.platforms }
    })
  }

  // If this post originated from a custom user topic, record its use
  const topicId = payload.topicId || (payload.topicObj && payload.topicObj.id)
  if (topicId) {
    try {
      dbService.markUserTopicUsed(topicId, 'used')
    } catch {}
  }

  postQueue.unshift(newPost)
  if (payload.source !== 'automation') {
    void publishAppEvent({
      type: 'social.post.created',
      id: `social.post.created:${newPost.id}`,
      brandId,
      payload: {
        source: payload.source || 'manual',
        status: newPost.status,
        platformId: newPost.platforms[0] || '',
        title: newPost.title
      }
    }).catch(error => console.error(`Automation event dispatch failed: ${error.message}`))
  }
  return newPost
}

/** Human approval is an explicit server-side action; automated sources cannot self-approve. */
export function approvePostForManualHandoff(postId, brandId = null) {
  const post = postQueue.find(item => item.id === postId && (!brandId || item.brandId === brandId))
  if (!post) return { success: false, error: 'Post not found.' }
  if (post.approvalStatus !== 'pending' || post.status !== 'pending_approval') {
    return { success: false, error: 'Post is not awaiting approval.', post }
  }
  post.approvalStatus = 'approved'
  post.approvedAt = new Date().toISOString()
  post.status = 'approved'
  post.handoffUrl = 'https://business.facebook.com/latest/home'
  dbService.savePost(post)
  return { success: true, post }
}

export function updatePendingPost(postId, brandId, updates = {}) {
  const post = postQueue.find(item => item.id === postId && item.brandId === brandId)
  if (!post || post.status !== 'pending_approval' || post.approvalStatus !== 'pending') return null
  if (typeof updates.title === 'string') post.title = updates.title.trim().slice(0, 200)
  if (updates.variants && typeof updates.variants === 'object' && !Array.isArray(updates.variants)) {
    post.variants = { ...post.variants, ...Object.fromEntries(Object.entries(updates.variants).filter(([, value]) => typeof value === 'string').map(([key, value]) => [key, value.slice(0, 10000)])) }
  }
  if (updates.reject === true) {
    post.status = 'rejected'
    post.approvalStatus = 'rejected'
    post.rejectedAt = new Date().toISOString()
  }
  dbService.savePost(post)
  return post
}

export function confirmManualPost(postId, brandId, platformIds = [], externalUrl = null) {
  const post = postQueue.find(item => item.id === postId && item.brandId === brandId)
  if (!post || post.status !== 'approved' || !Array.isArray(platformIds) || !platformIds.length) return null
  post.deliveryLogs ||= []
  for (const platformId of platformIds) {
    if (!post.platforms.includes(platformId)) continue
    post.deliveryLogs.push({ platformId, kind: 'confirmed', at: new Date().toISOString(), externalUrl })
  }
  const confirmed = new Set(post.deliveryLogs.filter(log => log.kind === 'confirmed').map(log => log.platformId))
  if (post.platforms.every(platformId => confirmed.has(platformId))) post.status = 'published'
  post.confirmedAt = new Date().toISOString()
  dbService.savePost(post)
  return post
}

/** Called when the user confirms (via the in-page "Mark posted" button) that a dispatch was actually posted. */
export function markPostConfirmed(postId, platformId, externalUrl = null) {
  const post = postQueue.find(p => p.id === postId)
  if (!post) return null
  post.deliveryLogs = post.deliveryLogs || []
  if (!post.deliveryLogs.some(l => l.kind === 'confirmed' && l.platformId === platformId)) {
    post.deliveryLogs.push({ platformId, kind: 'confirmed', at: new Date().toISOString(), externalUrl })
    logActivity(platformId, 'Confirmed posted', 'success', { externalUrl, message: `Confirmed live on ${platformId}` })
  }
  const confirmed = new Set(post.deliveryLogs.filter(l => l.kind === 'confirmed').map(l => l.platformId))
  const dispatched = new Set(post.deliveryLogs.filter(l => l.kind === 'dispatched').map(l => l.platformId))
  if (dispatched.size > 0 && [...dispatched].every(p => confirmed.has(p))) post.status = 'published'
  dbService.savePost(post)
  return post
}

/**
 * Queue cleanup. Defaults to a dry run so nothing is deleted unless dryRun:false is passed explicitly.
 */
export function pruneQueue({ olderThanDays = 14, statuses = ['scheduled'], dryRun = true } = {}) {
  const cutoff = Date.now() - olderThanDays * DAY_MS
  const victims = postQueue.filter(p => statuses.includes(p.status) && Date.parse(p.createdAt) <= cutoff)
  if (!dryRun) {
    for (const p of victims) deleteScheduledPost(p.id)
  }
  return { dryRun, count: victims.length, posts: victims.map(p => ({ id: p.id, title: p.title, status: p.status, createdAt: p.createdAt })) }
}

export function deleteScheduledPost(postId, brandId = null) {
  const idx = postQueue.findIndex(p => p.id === postId)
  if (idx === -1) return false
  if (brandId && postQueue[idx].brandId !== brandId) return false
  dbService.deletePost(postId)
  postQueue.splice(idx, 1)
  return true
}

export async function triggerKeepAlivePulse(targetPlatformId = null, brandId = DEFAULT_BRAND_ID) {
  const scopedConfigs = new Map(SUPPORTED_PLATFORMS.map(p => [p.id, getPlatformConfig(brandId, p.id)]))
  const results = await executeKeepAlivePulse(scopedConfigs, targetPlatformId, logItem => {
    logItem.brandId = brandId
    activityLogs.unshift(logItem)
    dbService.addActivityLog(logItem)
  })

  return {
    pulsedCount: results.length,
    results,
    platforms: getPlatformsStatus(brandId)
  }
}

export function getRssFeedXml() {
  return generateRssFeedXml({ posts: postQueue })
}
