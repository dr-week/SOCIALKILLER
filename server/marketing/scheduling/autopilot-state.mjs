import { dbService } from '../../db/sqlite-engine.mjs'

const STATE_KEY = 'autopilot_config'

export const autopilotConfig = {
  enabled: false,
  intervalHours: 4,
  targetPlatforms: ['x', 'reddit', 'linkedin', 'github', 'devto', 'ai_registry'],
  autoKeepAlive: true,
  lastRunAt: null,
  nextRunAt: null,
  totalAutoPosts: 0,
  consecutiveFailures: 0,
  lastError: null
}

export function persistAutopilotState() {
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

export function hydrateAutopilotState() {
  try {
    const saved = dbService.getSchedulerState(STATE_KEY)
    if (saved && typeof saved === 'object') {
      Object.assign(autopilotConfig, saved, { enabled: false, nextRunAt: null })
      if (saved.enabled) persistAutopilotState()
    }
  } catch (e) {
    console.warn('[Autopilot] Could not hydrate state from SQLite:', e.message)
  }
}

export async function withRetry(fn, { maxRetries = 3, baseDelayMs = 1500, label = 'task' } = {}) {
  let lastErr = null
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn()
    } catch (err) {
      lastErr = err
      if (attempt === maxRetries) break
      const delay = Math.round(baseDelayMs * Math.pow(2, attempt - 1) + Math.random() * 500)
      console.warn(
        `[Autopilot Retry] ${label} failed (attempt ${attempt}/${maxRetries}): ${err.message}. Retrying in ${delay}ms...`
      )
      await new Promise(r => setTimeout(r, delay))
    }
  }
  throw lastErr
}

hydrateAutopilotState()
