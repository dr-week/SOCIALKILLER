/**
 * Autopilot Social Media Manager & Growth Scheduler (<240 lines)
 * 
 * Reliability & Hardening Enhancements:
 * 1. Process crash survival: Persists configuration and run states in SQLite (`scheduler_state`).
 * 2. Network drop resilience: Exponential backoff with jitter and automated retry on transient network failures.
 * 3. Laptop sleep/wake compensation: Granular heartbeats (30s) detect missed intervals after system sleep.
 * 4. Idempotency integration: Generates and records idempotency tokens per cycle to prevent double-posting.
 */

import { getRandomViralTopic, formatViralPost } from './viral-hooks.mjs'
import { createOrPublishPost, getPlatformsStatus, triggerKeepAlivePulse } from './orchestrator.mjs'
import { dbService } from '../db/sqlite-engine.mjs'
import { createHash } from 'node:crypto'

const STATE_KEY = 'autopilot_config'

// Default in-memory config
let autopilotConfig = {
  enabled: false,
  intervalHours: 4, // Auto-post every 4 hours
  targetPlatforms: ['x', 'reddit', 'linkedin', 'github', 'devto', 'ai_registry'],
  autoKeepAlive: true,
  lastRunAt: null,
  nextRunAt: null,
  totalAutoPosts: 0,
  consecutiveFailures: 0,
  lastError: null
}

// Restore saved state from SQLite on startup
try {
  const saved = dbService.getSchedulerState(STATE_KEY)
  if (saved && typeof saved === 'object') {
    autopilotConfig = {
      ...autopilotConfig,
      ...saved,
      enabled: false,
      nextRunAt: null
    }
    if (saved.enabled) persistState()
  }
} catch (e) {
  console.warn('[Autopilot] Could not hydrate state from SQLite:', e.message)
}

function persistState() {
  try {
    dbService.setSchedulerState(STATE_KEY, {
      enabled: autopilotConfig.enabled,
      intervalHours: autopilotConfig.intervalHours,
      targetPlatforms: autopilotConfig.targetPlatforms,
      autoKeepAlive: autopilotConfig.autoKeepAlive,
      lastRunAt: autopilotConfig.lastRunAt,
      nextRunAt: autopilotConfig.nextRunAt,
      totalAutoPosts: autopilotConfig.totalAutoPosts,
      consecutiveFailures: autopilotConfig.consecutiveFailures
    })
  } catch (err) {
    console.warn('[Autopilot] Failed to persist state:', err.message)
  }
}

let autopilotHeartbeatTimer = null
let isRunningCycle = false

/**
 * Executes an async task with retries and exponential backoff
 */
async function withRetry(fn, { maxRetries = 3, baseDelayMs = 1500, label = 'task' } = {}) {
  let lastErr = null
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn()
    } catch (err) {
      lastErr = err
      const isLast = attempt === maxRetries
      if (isLast) break
      const delay = Math.round(baseDelayMs * Math.pow(2, attempt - 1) + Math.random() * 500)
      console.warn(`[Autopilot Retry] ${label} failed (attempt ${attempt}/${maxRetries}): ${err.message}. Retrying in ${delay}ms...`)
      await new Promise(r => setTimeout(r, delay))
    }
  }
  throw lastErr
}

/**
 * Execute a single cycle of the automated growth engine with full crash & drop resilience
 */
export async function runAutopilotCycle(reason = 'scheduled') {
  if (isRunningCycle) {
    return { success: false, skipped: true, reason: 'Autopilot cycle already executing' }
  }
  isRunningCycle = true

  try {
    // 1. Ingest fresh community discussion signals into self-updating dictionary
    try {
      const { scanAllDeveloperCommunities } = await import('./community-scanner.mjs')
      const { ingestCommunitySignalsToDictionary } = await import('./post-dictionary.mjs')
      const signals = await scanAllDeveloperCommunities({ tag: 'javascript' })
      if (signals?.signals?.length) {
        ingestCommunitySignalsToDictionary(signals.signals)
      }
    } catch (scanErr) {
      console.warn('[Autopilot] Community dictionary sync warning:', scanErr.message)
    }

    // 2. Pick a high-converting, non-repetitive topic across all content pillars
    const { getRandomPillarTopic, formatSystemPost } = await import('./content-system.mjs')
    const repoUrl = 'https://github.com/dr-week/fast-framework'
    const topic = getRandomPillarTopic(null, { preferPending: true })
    const formatted = formatSystemPost({ topicObj: topic, githubRepo: repoUrl, platform: 'x' })
    const media = formatted.media || null

    // Generate deterministic idempotency token for this post
    const payloadHash = createHash('sha256').update(`${topic.hook}|${formatted.mainPost}`.trim()).digest('hex')
    const idempotencyToken = `autopilot-${payloadHash.slice(0, 16)}-${new Date().toISOString().slice(0, 10)}`

    // 2. Publish across all target channels with retry resiliency
    const postResult = await withRetry(async () => {
      return await createOrPublishPost({
        idempotencyToken,
        source: 'autopilot',
        title: topic.hook,
        topic: topic.hook,
        rawNotes: formatted.mainPost,
        platforms: autopilotConfig.targetPlatforms,
        publishNow: false,
        dedupe: true,
        autoClickSubmit: false,
        webLink: repoUrl,
        imageUrl: media?.imageUrl || null,
        tags: media?.hashtags || []
      })
    }, { maxRetries: 3, baseDelayMs: 2000, label: 'createOrPublishPost' })

    // 3. Keep account streaks alive if enabled
    if (autopilotConfig.autoKeepAlive) {
      try {
        await triggerKeepAlivePulse()
      } catch (pulseErr) {
        console.warn('[Autopilot] Keep-alive pulse encountered warning:', pulseErr.message)
      }
    }

    // 4. Update autopilot telemetry & GitHub conversion feedback loop
    const isSuccessful = postResult && postResult.status === 'published'
    let feedbackTelemetry = null
    if (isSuccessful) {
      autopilotConfig.lastRunAt = new Date().toISOString()
      autopilotConfig.totalAutoPosts += 1
      autopilotConfig.consecutiveFailures = 0
      autopilotConfig.lastError = null

      try {
        const { updateGitHubFeedbackLoop } = await import('./feedback-loop.mjs')
        feedbackTelemetry = await updateGitHubFeedbackLoop(topic.category, topic.hook)
      } catch (fbErr) {
        console.warn('[Autopilot] Feedback loop update notice:', fbErr.message)
      }
    }
    autopilotConfig.nextRunAt = new Date(Date.now() + autopilotConfig.intervalHours * 3600 * 1000).toISOString()
    persistState()

    return {
      success: true,
      trigger: reason,
      topic: topic.hook,
      category: topic.category,
      repoPromoted: 'https://github.com/dr-week/fast-framework',
      post: postResult,
      feedback: feedbackTelemetry,
      idempotencyToken,
      nextScheduled: autopilotConfig.nextRunAt
    }
  } catch (err) {
    autopilotConfig.consecutiveFailures = (autopilotConfig.consecutiveFailures || 0) + 1
    autopilotConfig.lastError = err.message
    // Schedule backoff if failure occurred
    const backoffMinutes = Math.min(60, Math.pow(2, autopilotConfig.consecutiveFailures) * 5)
    autopilotConfig.nextRunAt = new Date(Date.now() + backoffMinutes * 60 * 1000).toISOString()
    persistState()

    return {
      success: false,
      error: err.message,
      consecutiveFailures: autopilotConfig.consecutiveFailures,
      nextRetry: autopilotConfig.nextRunAt
    }
  } finally {
    isRunningCycle = false
  }
}

/**
 * Start or update the automated posting scheduler with sleep/wake-aware heartbeat
 */
export function startAutopilotScheduler(intervalHours = null) {
  if (intervalHours) {
    autopilotConfig.intervalHours = Math.max(1, intervalHours)
  }
  autopilotConfig.enabled = true

  if (autopilotHeartbeatTimer) clearInterval(autopilotHeartbeatTimer)

  const msInterval = autopilotConfig.intervalHours * 3600 * 1000
  // If nextRunAt is missing or invalid, initialize it
  if (!autopilotConfig.nextRunAt || isNaN(Date.parse(autopilotConfig.nextRunAt))) {
    autopilotConfig.nextRunAt = new Date(Date.now() + msInterval).toISOString()
  }

  persistState()

  // High-frequency (30s) heartbeat to catch up after laptop sleep/wake cycles
  autopilotHeartbeatTimer = setInterval(async () => {
    if (!autopilotConfig.enabled) return

    const now = Date.now()
    const scheduledTime = autopilotConfig.nextRunAt ? Date.parse(autopilotConfig.nextRunAt) : 0

    if (now >= scheduledTime && !isRunningCycle) {
      await runAutopilotCycle('sleep_wake_or_timer_interval')
    }
  }, 30 * 1000)

  // Unref timer so Node process is not prevented from exiting cleanly during unit tests/shutdown
  if (autopilotHeartbeatTimer.unref) {
    autopilotHeartbeatTimer.unref()
  }

  return getAutopilotStatus()
}

/**
 * Stop or pause the automated posting scheduler
 */
export function stopAutopilotScheduler() {
  autopilotConfig.enabled = false
  if (autopilotHeartbeatTimer) {
    clearInterval(autopilotHeartbeatTimer)
    autopilotHeartbeatTimer = null
  }
  autopilotConfig.nextRunAt = null
  persistState()
  return getAutopilotStatus()
}

/**
 * Get current autopilot telemetry and schedule configuration
 */
export function getAutopilotStatus() {
  return {
    ...autopilotConfig,
    activeTimer: Boolean(autopilotHeartbeatTimer),
    supportedPlatforms: getPlatformsStatus().map(p => p.id)
  }
}
