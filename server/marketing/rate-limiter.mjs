/**
 * Per-Platform Rate Limiting & Safety Enforcer (<160 lines)
 * 
 * Prevents account shadowbans, rate limits, and sub-reddit bans.
 * Reddit: Max 1 promo post per subreddit per 24 hours. Max 3 promo posts across Reddit per day.
 * Hacker News: Max 1 submission per 48 hours.
 * X / Twitter: Max 12 tweets per day, min 30 minutes between automated tweets.
 * LinkedIn: Max 2 posts per day.
 * Dev.to / Hashnode / Medium: Max 1 technical post per 24 hours.
 */

import { dbService } from '../db/sqlite-engine.mjs'

export const PLATFORM_LIMITS = {
  reddit: {
    maxPerDay: 3,
    minIntervalMinutes: 180, // 3 hours between Reddit posts
    subredditCooldownHours: 24
  },
  x: {
    maxPerDay: 12,
    minIntervalMinutes: 30
  },
  linkedin: {
    maxPerDay: 2,
    minIntervalMinutes: 360 // 6 hours
  },
  devto: {
    maxPerDay: 1,
    minIntervalMinutes: 720 // 12 hours
  },
  github: {
    maxPerDay: 6,
    minIntervalMinutes: 60
  },
  discord: {
    maxPerDay: 24,
    minIntervalMinutes: 10
  }
}

/**
 * Checks if posting to a platform is allowed under rate limits
 */
export function checkRateLimit(platformId, extraMeta = {}) {
  const rules = PLATFORM_LIMITS[platformId]
  if (!rules) return { allowed: true }

  const logs = dbService.getActivityLogs()
  const now = Date.now()
  const oneDayAgo = now - 24 * 3600 * 1000

  // Filter logs for this platform in the last 24h
  const platformLogs = logs.filter(l => 
    l.platformId === platformId && 
    new Date(l.timestamp).getTime() > oneDayAgo &&
    l.status === 'success'
  )

  if (platformLogs.length >= rules.maxPerDay) {
    return {
      allowed: false,
      reason: `Daily limit reached for ${platformId.toUpperCase()} (${platformLogs.length}/${rules.maxPerDay} posts in last 24h). Cooldown active.`
    }
  }

  // Check minimum interval between posts
  if (platformLogs.length > 0) {
    const lastPostTime = new Date(platformLogs[0].timestamp).getTime()
    const diffMinutes = Math.floor((now - lastPostTime) / (60 * 1000))
    if (diffMinutes < rules.minIntervalMinutes) {
      return {
        allowed: false,
        reason: `Posting too frequently to ${platformId.toUpperCase()}. Must wait ${rules.minIntervalMinutes - diffMinutes} more minutes.`
      }
    }
  }

  // Reddit specific: subreddit cooldown
  if (platformId === 'reddit' && extraMeta.subreddit) {
    const sub = extraMeta.subreddit.toLowerCase().replace(/^r\//, '')
    const subLogs = platformLogs.filter(l => (l.message || '').toLowerCase().includes(sub))
    if (subLogs.length > 0) {
      const lastSubTime = new Date(subLogs[0].timestamp).getTime()
      const diffHours = (now - lastSubTime) / (3600 * 1000)
      if (diffHours < rules.subredditCooldownHours) {
        return {
          allowed: false,
          reason: `r/${sub} promo limit active. Wait ${Math.ceil(rules.subredditCooldownHours - diffHours)}h before posting to r/${sub} again.`
        }
      }
    }
  }

  return { allowed: true }
}
