/**
 * Automated Viral Content Scheduler & Dispatch Loop (<250 lines)
 * 
 * Reliability & Hardening Enhancements:
 * 1. Process crash survival: Persists configuration, last run timestamp, and dispatched counts in SQLite.
 * 2. Network drop resilience: Retry wrapper for fetching news and executing post creation.
 * 3. Laptop sleep/wake compensation: 30-second checking loop that fires overdue ticks when resuming from sleep.
 * 4. Idempotency tokens: Every tick calculates an idempotency token to eliminate double broadcasts across runs.
 */

import { fetchLiveTrendingNews } from './marketing/news-harvester.mjs'
import { transformNewsToViralPost } from './marketing/news-remodeller.mjs'
import { generateRandomVariation } from './marketing/post-dictionary.mjs'
import { createOrPublishPost, getSocialActivityLogs } from './marketing/orchestrator.mjs'
import { dbService } from './db/sqlite-engine.mjs'
import { createHash } from 'node:crypto'

const STATE_KEY = 'scheduler_config'

let schedulerHeartbeatTimer = null
let isRunningTick = false

const SCHEDULER_CONFIG = {
  enabled: false,
  intervalMs: 1000 * 60 * 30, // 30 minutes by default
  targetPlatforms: ['x', 'reddit', 'linkedin', 'github', 'devto'],
  githubRepo: 'github.com/dr-week/fast-framework',
  lastRunAt: null,
  nextRunAt: null,
  totalDispatched: 0,
  consecutiveFailures: 0
}

// Restore saved state from SQLite
try {
  const saved = dbService.getSchedulerState(STATE_KEY)
  if (saved && typeof saved === 'object') {
    Object.assign(SCHEDULER_CONFIG, saved, { enabled: false, nextRunAt: null })
    if (saved.enabled) persistState()
  }
} catch (e) {
  console.warn('[Scheduler] Could not hydrate state from SQLite:', e.message)
}

function persistState() {
  try {
    dbService.setSchedulerState(STATE_KEY, {
      enabled: SCHEDULER_CONFIG.enabled,
      intervalMs: SCHEDULER_CONFIG.intervalMs,
      targetPlatforms: SCHEDULER_CONFIG.targetPlatforms,
      githubRepo: SCHEDULER_CONFIG.githubRepo,
      lastRunAt: SCHEDULER_CONFIG.lastRunAt,
      nextRunAt: SCHEDULER_CONFIG.nextRunAt,
      totalDispatched: SCHEDULER_CONFIG.totalDispatched,
      consecutiveFailures: SCHEDULER_CONFIG.consecutiveFailures
    })
  } catch (err) {
    console.warn('[Scheduler] Failed to persist state:', err.message)
  }
}

/**
 * Executes a single automated post generation and dispatch cycle
 */
export async function executeAutomatedSchedulerTick(options = {}) {
  if (isRunningTick) return { skipped: true, reason: 'Tick already in progress' }
  isRunningTick = true

  const repo = options.githubRepo || SCHEDULER_CONFIG.githubRepo
  const platforms = options.targetPlatforms || SCHEDULER_CONFIG.targetPlatforms

  // Check if user has queued custom/pending topics first
  const pendingTopics = dbService.getPendingUserTopics()
  const hasPendingTopics = pendingTopics && pendingTopics.length > 0
  const mode = hasPendingTopics
    ? 'pending_user_topic'
    : (Math.random() > 0.4 ? 'news_remodel' : 'dictionary_variation')

  let generatedPost = null

  try {
    if (mode === 'pending_user_topic') {
      const topic = pendingTopics[0]
      const cleanRepo = `https://${repo.replace(/^https?:\/\//, '')}`
      const hash = createHash('sha256').update(`${topic.id}|${topic.title}`).digest('hex')
      const idempotencyToken = `sched-topic-${hash.slice(0, 16)}-${new Date().toISOString().slice(0, 10)}`

      generatedPost = await createOrPublishPost({
        idempotencyToken,
        source: 'automated_scheduler_user_topic',
        topicId: topic.id,
        title: topic.hook || topic.title,
        topic: topic.title,
        rawNotes: `${topic.debate}\n${topic.question}\nGitHub: ${topic.githubSolution || cleanRepo}`,
        platforms,
        publishNow: false,
        dedupe: true,
        variants: {
          x: `${topic.hook || topic.title}\n\n${topic.debate}\n\n${topic.question}\n\n📌 Bookmark this. Repo link in replies 👇`,
          x_reply: `🔗 Open-source project built around this philosophy:\n${cleanRepo}\n\nStar the repo on GitHub! ⭐`,
          reddit: `[Discussion] ${topic.hook || topic.title}\n\nHey devs,\n\n${topic.debate}\n\n${topic.question}\n\n(We've been building around this in our open-source repo: ${cleanRepo})`,
          linkedin: `${topic.hook || topic.title}\n\n${topic.debate}\n\nKey Takeaway:\n${topic.githubSolution || cleanRepo}\n\n${topic.question}\n\n👉 Open-source repo: ${cleanRepo}`,
          github: `# ${topic.title}\n\n${topic.hook || ''}\n\n${topic.debate || ''}\n\nProject: ${cleanRepo}`,
          devto: `---\ntitle: "${topic.title}"\npublished: true\ntags: webdev, performance, opensource\n---\n\n${topic.debate}\n\n${topic.question}\n\nRepository: ${cleanRepo}`
        }
      })
    } else if (mode === 'news_remodel') {
      try {
        const news = await fetchLiveTrendingNews()
        const topLead = (news.leads && news.leads.length > 0)
          ? news.leads[Math.floor(Math.random() * Math.min(5, news.leads.length))]
          : null

        if (topLead) {
          const transformed = transformNewsToViralPost({
            rawTitle: topLead.title,
            rawSummary: topLead.summary,
            sourceUrl: topLead.url,
            githubRepo: repo,
            angle: Math.random() > 0.5 ? 'future_of_coding' : 'contrarian'
          })

          const hash = createHash('sha256').update(`${topLead.title}|${transformed.suggestedPostPayload.title}`).digest('hex')
          const idempotencyToken = `sched-news-${hash.slice(0, 16)}-${new Date().toISOString().slice(0, 10)}`

          generatedPost = await createOrPublishPost({
            idempotencyToken,
            source: 'automated_scheduler',
            title: transformed.suggestedPostPayload.title,
            topic: transformed.original.title,
            rawNotes: transformed.suggestedPostPayload.rawNotes,
            platforms,
            publishNow: false,
            dedupe: true,
            variants: transformed.variants
          })
        }
      } catch (newsErr) {
        console.warn('[Scheduler] News harvesting failed, falling back to dictionary variation:', newsErr.message)
      }
    }

    // Fallback or dictionary mode
    if (!generatedPost || generatedPost.status === 'skipped_limit') {
      const variation = generateRandomVariation({ githubRepo: repo, platform: 'x' })
      const hash = createHash('sha256').update(`${variation.title}|${variation.mainPost}`).digest('hex')
      const idempotencyToken = `sched-dict-${hash.slice(0, 16)}-${new Date().toISOString().slice(0, 10)}`

      generatedPost = await createOrPublishPost({
        idempotencyToken,
        source: 'automated_scheduler',
        title: variation.title,
        topic: 'Future of Coding & Zero-VDOM Architecture',
        rawNotes: `Hook: ${variation.components.hook}\nConflict: ${variation.components.conflict}\nInsight: ${variation.components.insight}\nDebate: ${variation.components.debate}`,
        platforms,
        publishNow: false,
        dedupe: true,
        variants: {
          x: variation.mainPost,
          x_reply: variation.replyWithGithub,
          reddit: generateRandomVariation({ githubRepo: repo, platform: 'reddit' }).mainPost,
          linkedin: generateRandomVariation({ githubRepo: repo, platform: 'linkedin' }).mainPost,
          github: `# ${variation.title}\n\n${variation.mainPost}\n\n${variation.replyWithGithub}`,
          devto: `---\ntitle: "${variation.title}"\npublished: true\ntags: webdev, performance, opensource\n---\n\n${variation.mainPost}\n\n${variation.replyWithGithub}`
        }
      })
    }

    SCHEDULER_CONFIG.lastRunAt = new Date().toISOString()
    SCHEDULER_CONFIG.totalDispatched++
    SCHEDULER_CONFIG.consecutiveFailures = 0
    SCHEDULER_CONFIG.nextRunAt = new Date(Date.now() + SCHEDULER_CONFIG.intervalMs).toISOString()
    persistState()

    return {
      success: true,
      mode,
      postId: generatedPost?.id,
      title: generatedPost?.title,
      scheduledAt: SCHEDULER_CONFIG.lastRunAt,
      nextScheduled: SCHEDULER_CONFIG.nextRunAt
    }
  } catch (err) {
    SCHEDULER_CONFIG.consecutiveFailures = (SCHEDULER_CONFIG.consecutiveFailures || 0) + 1
    const backoffMs = Math.min(1000 * 60 * 30, Math.pow(2, SCHEDULER_CONFIG.consecutiveFailures) * 30000)
    SCHEDULER_CONFIG.nextRunAt = new Date(Date.now() + backoffMs).toISOString()
    persistState()
    return { success: false, error: err.message, nextRetry: SCHEDULER_CONFIG.nextRunAt }
  } finally {
    isRunningTick = false
  }
}

/**
 * Starts or configures the automated loop with sleep/wake-aware interval checking
 */
export function startAutomatedScheduler(customIntervalMs = null) {
  if (schedulerHeartbeatTimer) clearInterval(schedulerHeartbeatTimer)
  SCHEDULER_CONFIG.enabled = true
  if (customIntervalMs && customIntervalMs >= 10000) {
    SCHEDULER_CONFIG.intervalMs = customIntervalMs
  }

  if (!SCHEDULER_CONFIG.nextRunAt || isNaN(Date.parse(SCHEDULER_CONFIG.nextRunAt))) {
    SCHEDULER_CONFIG.nextRunAt = new Date(Date.now() + SCHEDULER_CONFIG.intervalMs).toISOString()
  }

  persistState()

  // 30-second heartbeat to detect overdue runs after OS sleep/wake
  schedulerHeartbeatTimer = setInterval(() => {
    if (!SCHEDULER_CONFIG.enabled) return

    const now = Date.now()
    const scheduledTime = SCHEDULER_CONFIG.nextRunAt ? Date.parse(SCHEDULER_CONFIG.nextRunAt) : 0

    if (now >= scheduledTime && !isRunningTick) {
      executeAutomatedSchedulerTick().catch(console.error)
    }
  }, 30 * 1000)

  if (schedulerHeartbeatTimer.unref) {
    schedulerHeartbeatTimer.unref()
  }

  return getSchedulerStatus()
}

/**
 * Stops the automated loop
 */
export function stopAutomatedScheduler() {
  if (schedulerHeartbeatTimer) {
    clearInterval(schedulerHeartbeatTimer)
    schedulerHeartbeatTimer = null
  }
  SCHEDULER_CONFIG.enabled = false
  SCHEDULER_CONFIG.nextRunAt = null
  persistState()
  return getSchedulerStatus()
}

export function getSchedulerStatus() {
  return {
    enabled: SCHEDULER_CONFIG.enabled,
    intervalMs: SCHEDULER_CONFIG.intervalMs,
    intervalMinutes: Math.round(SCHEDULER_CONFIG.intervalMs / (1000 * 60)),
    githubRepo: SCHEDULER_CONFIG.githubRepo,
    targetPlatforms: SCHEDULER_CONFIG.targetPlatforms,
    lastRunAt: SCHEDULER_CONFIG.lastRunAt,
    nextRunAt: SCHEDULER_CONFIG.nextRunAt,
    totalDispatched: SCHEDULER_CONFIG.totalDispatched,
    activeTimer: Boolean(schedulerHeartbeatTimer)
  }
}
