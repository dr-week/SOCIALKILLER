/**
 * Promo Frequency & Deduplication Limits (<100 lines)
 * 
 * Enforces community rate limit rules (e.g. Reddit 90/10 rule)
 * and content fingerprint deduplication.
 */

import { createHash } from 'node:crypto'

export const DAY_MS = 24 * 3600 * 1000
export const DEDUPE_WINDOW_MS = 30 * DAY_MS
export const STALE_DISPATCH_MS = 24 * 3600 * 1000

export const PROMO_LIMITS = {
  reddit: { max: 3, windowMs: DAY_MS },
  devto: { max: 2, windowMs: DAY_MS },
  hashnode: { max: 2, windowMs: DAY_MS },
  x: { max: 5, windowMs: DAY_MS },
  linkedin: { max: 2, windowMs: DAY_MS },
  github: { max: 3, windowMs: DAY_MS },
  discord: { max: 5, windowMs: DAY_MS }
}

export function fingerprintPost(title, variants) {
  const body = variants?.x || Object.values(variants || {})[0] || ''
  return createHash('sha1').update(`${title}|${body}`.toLowerCase().replace(/\s+/g, ' ').trim()).digest('hex')
}

export function findDuplicatePost(postQueue, title, variants) {
  const fp = fingerprintPost(title, variants)
  const now = Date.now()
  return postQueue.find(p => now - Date.parse(p.createdAt) < DEDUPE_WINDOW_MS && fingerprintPost(p.title, p.variants) === fp) || null
}

export function countRecentDispatches(postQueue, platformId) {
  const lim = PROMO_LIMITS[platformId]
  if (!lim) return 0
  const now = Date.now()
  let n = 0
  for (const p of postQueue) {
    for (const l of p.deliveryLogs || []) {
      if (l.platformId === platformId && l.kind === 'dispatched' && now - Date.parse(l.at) < lim.windowMs) n++
    }
  }
  return n
}

export function getPromoLimitStatus(postQueue) {
  return Object.entries(PROMO_LIMITS).map(([platformId, lim]) => ({
    platformId,
    max: lim.max,
    windowHours: lim.windowMs / 3600000,
    used: countRecentDispatches(postQueue, platformId)
  }))
}
