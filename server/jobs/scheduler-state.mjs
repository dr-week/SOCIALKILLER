import { dbService } from '../db/sqlite-engine.mjs'

const STATE_KEY = 'scheduler_config'

export const SCHEDULER_CONFIG = {
  enabled: false,
  intervalMs: 1000 * 60 * 30,
  targetPlatforms: ['x', 'reddit', 'linkedin', 'github', 'devto'],
  githubRepo: 'github.com/dr-week/fast-framework',
  lastRunAt: null,
  nextRunAt: null,
  totalDispatched: 0,
  consecutiveFailures: 0
}

try {
  const saved = dbService.getSchedulerState(STATE_KEY)
  if (saved && typeof saved === 'object') {
    Object.assign(SCHEDULER_CONFIG, saved, { enabled: false, nextRunAt: null })
    if (saved.enabled) persistSchedulerState()
  }
} catch (e) {
  console.warn('[Scheduler] Could not hydrate state from SQLite:', e.message)
}

export function persistSchedulerState() {
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

export function getSchedulerStatus(activeTimer = false) {
  return {
    enabled: SCHEDULER_CONFIG.enabled,
    intervalMs: SCHEDULER_CONFIG.intervalMs,
    intervalMinutes: Math.round(SCHEDULER_CONFIG.intervalMs / (1000 * 60)),
    githubRepo: SCHEDULER_CONFIG.githubRepo,
    targetPlatforms: SCHEDULER_CONFIG.targetPlatforms,
    lastRunAt: SCHEDULER_CONFIG.lastRunAt,
    nextRunAt: SCHEDULER_CONFIG.nextRunAt,
    totalDispatched: SCHEDULER_CONFIG.totalDispatched,
    activeTimer: Boolean(activeTimer)
  }
}
