import { SCHEDULER_CONFIG, persistSchedulerState, getSchedulerStatus as buildStatus } from './jobs/scheduler-state.mjs'
import { executeAutomatedSchedulerTick, isTickRunning } from './jobs/scheduler-tick.mjs'

let schedulerHeartbeatTimer = null

export { executeAutomatedSchedulerTick }

export function startAutomatedScheduler(customIntervalMs = null) {
  if (schedulerHeartbeatTimer) clearInterval(schedulerHeartbeatTimer)
  SCHEDULER_CONFIG.enabled = true
  if (customIntervalMs && customIntervalMs >= 10000) SCHEDULER_CONFIG.intervalMs = customIntervalMs
  if (!SCHEDULER_CONFIG.nextRunAt || isNaN(Date.parse(SCHEDULER_CONFIG.nextRunAt))) {
    SCHEDULER_CONFIG.nextRunAt = new Date(Date.now() + SCHEDULER_CONFIG.intervalMs).toISOString()
  }
  persistSchedulerState()

  schedulerHeartbeatTimer = setInterval(() => {
    if (!SCHEDULER_CONFIG.enabled) return
    const scheduledTime = SCHEDULER_CONFIG.nextRunAt ? Date.parse(SCHEDULER_CONFIG.nextRunAt) : 0
    if (Date.now() >= scheduledTime && !isTickRunning()) {
      executeAutomatedSchedulerTick().catch(console.error)
    }
  }, 30 * 1000)
  schedulerHeartbeatTimer.unref?.()

  return getSchedulerStatus()
}

export function stopAutomatedScheduler() {
  if (schedulerHeartbeatTimer) {
    clearInterval(schedulerHeartbeatTimer)
    schedulerHeartbeatTimer = null
  }
  SCHEDULER_CONFIG.enabled = false
  SCHEDULER_CONFIG.nextRunAt = null
  persistSchedulerState()
  return getSchedulerStatus()
}

export function getSchedulerStatus() {
  return buildStatus(schedulerHeartbeatTimer)
}
