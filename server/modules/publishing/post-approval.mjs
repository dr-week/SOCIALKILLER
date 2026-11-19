import { dbService } from '../../db/sqlite-engine.mjs'
import { normalizeQueuedPost } from '../../marketing/post-queue-normalizer.mjs'
import { logActivity } from './post-store.mjs'

function loadNormalizedPost(postId, brandId = null) {
  const raw = dbService.getPostById(postId)
  if (!raw) return null
  const post = normalizeQueuedPost(raw)
  if (brandId && post.brandId !== brandId) return null
  return post
}

/** Human approval is an explicit server-side action; automated sources cannot self-approve. */
export function approvePostForManualHandoff(postId, brandId = null) {
  const post = loadNormalizedPost(postId, brandId)
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
  const post = loadNormalizedPost(postId, brandId)
  if (!post || post.status !== 'pending_approval' || post.approvalStatus !== 'pending') return null
  if (typeof updates.title === 'string') post.title = updates.title.trim().slice(0, 200)
  if (updates.variants && typeof updates.variants === 'object' && !Array.isArray(updates.variants)) {
    const cleanVariants = Object.fromEntries(
      Object.entries(updates.variants)
        .filter(([, value]) => typeof value === 'string')
        .map(([key, value]) => [key, value.slice(0, 10000)])
    )
    post.variants = { ...post.variants, ...cleanVariants }
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
  const post = loadNormalizedPost(postId, brandId)
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
  const post = loadNormalizedPost(postId)
  if (!post) return null
  post.deliveryLogs = post.deliveryLogs || []
  if (!post.deliveryLogs.some(l => l.kind === 'confirmed' && l.platformId === platformId)) {
    post.deliveryLogs.push({ platformId, kind: 'confirmed', at: new Date().toISOString(), externalUrl })
    logActivity(platformId, 'Confirmed posted', 'success', { brandId: post.brandId, externalUrl, message: `Confirmed live on ${platformId}` })
  }
  const confirmed = new Set(post.deliveryLogs.filter(l => l.kind === 'confirmed').map(l => l.platformId))
  const dispatched = new Set(post.deliveryLogs.filter(l => l.kind === 'dispatched').map(l => l.platformId))
  if (dispatched.size > 0 && [...dispatched].every(p => confirmed.has(p))) post.status = 'published'
  dbService.savePost(post)
  return post
}
