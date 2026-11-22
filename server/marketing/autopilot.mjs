/**
 * Autopilot Social Media Manager & Growth Scheduler (<150 lines)
 */

import { createHash } from 'node:crypto'
import { createOrPublishPost, getPlatformsStatus, triggerKeepAlivePulse } from './orchestrator.mjs'
import { autopilotConfig, persistAutopilotState, withRetry } from './scheduling/autopilot-state.mjs'

let autopilotHeartbeatTimer = null
let isRunningCycle = false

export async function runAutopilotCycle(reason = 'scheduled') {
  if (isRunningCycle) {
    return { success: false, skipped: true, reason: 'Autopilot cycle already executing' }
  }
  isRunningCycle = true

  try {
    try {
      const { scanAllDeveloperCommunities } = await import('./community-scanner.mjs')
      const { ingestCommunitySignalsToDictionary } = await import('./post-dictionary.mjs')
      const signals = await scanAllDeveloperCommunities({ tag: 'javascript' })
      if (signals?.signals?.length) ingestCommunitySignalsToDictionary(signals.signals)
    } catch (scanErr) {
      console.warn('[Autopilot] Community dictionary sync warning:', scanErr.message)
    }

    const { getRandomPillarTopic, formatSystemPost } = await import('./content-system.mjs')
    const repoUrl = 'https://github.com/dr-week/fast-framework'
    const topic = getRandomPillarTopic(null, { preferPending: true })
    const formatted = formatSystemPost({ topicObj: topic, githubRepo: repoUrl, platform: 'x' })
    const media = formatted.media || null

    const payloadHash = createHash('sha256')
      .update(`${topic.hook}|${formatted.mainPost}`.trim())
      .digest('hex')
    const idempotencyToken = `autopilot-${payloadHash.slice(0, 16)}-${new Date().toISOString().slice(0, 10)}`

    const postResult = await withRetry(
      () =>
        createOrPublishPost({
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
        }),
      { maxRetries: 3, baseDelayMs: 2000, label: 'createOrPublishPost' }
    )

    if (autopilotConfig.autoKeepAlive) {
      try {
        await triggerKeepAlivePulse()
      } catch (pulseErr) {
        console.warn('[Autopilot] Keep-alive pulse encountered warning:', pulseErr.message)
      }
    }

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
    autopilotConfig.nextRunAt = new Date(
      Date.now() + autopilotConfig.intervalHours * 3600 * 1000
    ).toISOString()
    persistAutopilotState()

    return {
      success: true,
      trigger: reason,
      topic: topic.hook,
      category: topic.category,
      repoPromoted: repoUrl,
      post: postResult,
      feedback: feedbackTelemetry,
      idempotencyToken,
      nextScheduled: autopilotConfig.nextRunAt
    }
  } catch (err) {
    autopilotConfig.consecutiveFailures = (autopilotConfig.consecutiveFailures || 0) + 1
    autopilotConfig.lastError = err.message
    const backoffMinutes = Math.min(60, Math.pow(2, autopilotConfig.consecutiveFailures) * 5)
    autopilotConfig.nextRunAt = new Date(Date.now() + backoffMinutes * 60 * 1000).toISOString()
    persistAutopilotState()
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

export function startAutopilotScheduler(intervalHours = null) {
  if (intervalHours) autopilotConfig.intervalHours = Math.max(1, intervalHours)
  autopilotConfig.enabled = true
  if (autopilotHeartbeatTimer) clearInterval(autopilotHeartbeatTimer)

  const msInterval = autopilotConfig.intervalHours * 3600 * 1000
  if (!autopilotConfig.nextRunAt || isNaN(Date.parse(autopilotConfig.nextRunAt))) {
    autopilotConfig.nextRunAt = new Date(Date.now() + msInterval).toISOString()
  }
  persistAutopilotState()

  autopilotHeartbeatTimer = setInterval(async () => {
    if (!autopilotConfig.enabled) return
    const scheduledTime = autopilotConfig.nextRunAt ? Date.parse(autopilotConfig.nextRunAt) : 0
    if (Date.now() >= scheduledTime && !isRunningCycle) {
      await runAutopilotCycle('sleep_wake_or_timer_interval')
    }
  }, 30 * 1000)

  if (autopilotHeartbeatTimer.unref) autopilotHeartbeatTimer.unref()
  return getAutopilotStatus()
}

export function stopAutopilotScheduler() {
  autopilotConfig.enabled = false
  if (autopilotHeartbeatTimer) { clearInterval(autopilotHeartbeatTimer); autopilotHeartbeatTimer = null }
  autopilotConfig.nextRunAt = null
  persistAutopilotState()
  return getAutopilotStatus()
}

export function getAutopilotStatus() {
  return { ...autopilotConfig, activeTimer: Boolean(autopilotHeartbeatTimer), supportedPlatforms: getPlatformsStatus().map(p => p.id) }
}
