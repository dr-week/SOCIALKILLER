import { dbService } from '../../db/sqlite-engine.mjs'
import {
  PROMO_LIMITS,
  DAY_MS,
  STALE_DISPATCH_MS,
  countRecentDispatches as _countRecentDispatches,
  getPromoLimitStatus as _getPromoLimitStatus
} from '../../marketing/promo-limits.mjs'
import { normalizeQueuedPost } from '../../marketing/post-queue-normalizer.mjs'

export const DEFAULT_BRAND_ID = 'danger-labs'
export { PROMO_LIMITS }

export function getPostsQueue(brandId = null) {
  const posts = dbService.getAllPosts().map(normalizeQueuedPost)
  return brandId ? posts.filter(post => post.brandId === brandId) : posts
}

export function getSocialActivityLogs(brandId = null) {
  return dbService.getActivityLogs(brandId)
}

export function getPendingBrowserDispatches() {
  return dbService.getPendingDispatches()
}

export function pushPendingBrowserDispatch(dispatch) {
  if (!dispatch || !dispatch.id) return null
  dbService.pushDispatch(dispatch)
  return dispatch
}

export function popPendingBrowserDispatch(id) {
  return dbService.popDispatch(id) || null
}

export function countRecentDispatches(platformId, brandId = null) {
  return _countRecentDispatches(getPostsQueue(brandId), platformId)
}

export function getPromoLimitStatus() {
  return _getPromoLimitStatus(getPostsQueue())
}

/** Drops browser dispatches nobody picked up within 24h so they never fire at a surprising later time. */
export function pruneStaleDispatches() {
  const now = Date.now()
  let removed = 0
  for (const d of dbService.getPendingDispatches()) {
    if (now - Date.parse(d.queuedAt) > STALE_DISPATCH_MS) {
      dbService.popDispatch(d.id)
      removed++
    }
  }
  return removed
}

export function queueBrowserDispatch(post, pId, title, text, intentUrl, autoClickSubmit) {
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
  return dispItem
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
  return logItem
}

export function deleteScheduledPost(postId, brandId = null) {
  const post = dbService.getPostById(postId)
  if (!post) return false
  if (brandId && post.brandId !== brandId) return false
  dbService.deletePost(postId)
  return true
}

/** Queue cleanup. Defaults to a dry run so nothing is deleted unless dryRun:false is passed explicitly. */
export function pruneQueue({ olderThanDays = 14, statuses = ['scheduled'], dryRun = true } = {}) {
  const cutoff = Date.now() - olderThanDays * DAY_MS
  const victims = getPostsQueue().filter(p => statuses.includes(p.status) && Date.parse(p.createdAt) <= cutoff)
  if (!dryRun) {
    for (const p of victims) deleteScheduledPost(p.id)
  }
  return {
    dryRun,
    count: victims.length,
    posts: victims.map(p => ({ id: p.id, title: p.title, status: p.status, createdAt: p.createdAt }))
  }
}
