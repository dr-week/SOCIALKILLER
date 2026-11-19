import { randomUUID } from 'node:crypto'
import { db } from '../db/sqlite-engine.mjs'
import { createOrPublishPost } from '../marketing/orchestrator.mjs'
import { createAutomationRepository } from './automation-repository.mjs'
import { normalizeAutomationDefinition, AutomationValidationError } from './automation-definition.mjs'
import { createAutomationEngine } from './automation-engine.mjs'
import { subscribeToAppEvents } from './event-bus.mjs'

const repository = createAutomationRepository(db)
const engine = createAutomationEngine(repository, (action, context) => createOrPublishPost({
  brandId: context.brandId,
  title: action.topic,
  topic: action.topic,
  rawNotes: action.notes,
  platforms: action.platformIds,
  publishNow: false,
  status: 'draft',
  source: 'automation',
  idempotencyToken: `${context.ruleId}:${context.triggerId}:${context.actionIndex}`,
  enforceLimits: false
}))
let scheduler
let unsubscribe
let ticking = false

function requireBrandId(brandId) {
  if (typeof brandId !== 'string' || !brandId.trim() || brandId.length > 120) {
    throw new AutomationValidationError('A valid brandId is required.')
  }
  return brandId.trim()
}

export function listAutomationWorkspace(brandId) {
  const scopedBrandId = requireBrandId(brandId)
  return { rules: repository.getRules(scopedBrandId), runs: repository.getRuns(scopedBrandId) }
}

export function createAutomation(input) {
  const brandId = requireBrandId(input.brandId)
  const definition = normalizeAutomationDefinition(input, brandId, randomUUID(), false)
  return repository.saveRule(definition)
}

export function updateAutomation(id, brandId, input) {
  const scopedBrandId = requireBrandId(brandId)
  const existing = repository.getRule(id, scopedBrandId)
  if (!existing) return null
  const definition = normalizeAutomationDefinition({ ...existing, ...input }, scopedBrandId, id, existing.enabled)
  return repository.saveRule(definition)
}

export function setAutomationEnabled(id, brandId, enabled) {
  const scopedBrandId = requireBrandId(brandId)
  if (typeof enabled !== 'boolean') throw new AutomationValidationError('enabled must be a boolean.')
  if (!repository.setEnabled(id, scopedBrandId, enabled)) return null
  return repository.getRule(id, scopedBrandId)
}

export function deleteAutomation(id, brandId) {
  return repository.deleteRule(id, requireBrandId(brandId))
}

export async function runAutomationNow(id, brandId, event = {}) {
  const scopedBrandId = requireBrandId(brandId)
  if (!event || typeof event !== 'object' || Array.isArray(event)) {
    throw new AutomationValidationError('The manual trigger payload must be an object.')
  }
  const rule = repository.getRule(id, scopedBrandId)
  if (!rule) return null
  if (!rule.enabled) throw new AutomationValidationError('Activate this workflow before running it.')
  const triggerId = `manual:${randomUUID()}`
  const result = await engine.run(rule, { source: 'manual', ...event }, triggerId)
  repository.touchRule(id, scopedBrandId, result.completedAt || new Date().toISOString())
  return result
}

export async function retryAutomationRun(runId, brandId) {
  const scopedBrandId = requireBrandId(brandId)
  const run = repository.getRun(runId, scopedBrandId)
  if (!run) return null
  const rule = repository.getRule(run.ruleId, scopedBrandId)
  if (!rule?.enabled) throw new AutomationValidationError('Activate the workflow before retrying its failed run.')
  return engine.retry(run, rule)
}

async function handleAppEvent(event) {
  if (!event?.type || !event.brandId || !event.id) return
  const rules = repository.getEnabledRules(event.brandId).filter(rule => rule.triggerType === event.type)
  for (const rule of rules) await engine.run(rule, event.payload || {}, event.id)
}

async function runDueSchedules() {
  if (ticking) return
  ticking = true
  try {
    const now = Date.now()
    for (const rule of repository.getScheduledRules()) {
      const interval = rule.triggerConfig.intervalMinutes * 60_000
      const dueAt = Date.parse(rule.lastRunAt || rule.createdAt) + interval
      if (now < dueAt) continue
      const event = { source: 'schedule', status: 'due', scheduledAt: new Date(dueAt).toISOString() }
      const triggerId = `schedule:${rule.id}:${dueAt}`
      const run = await engine.run(rule, event, triggerId)
      repository.touchRule(rule.id, rule.brandId, run.completedAt || new Date().toISOString())
    }
  } finally { ticking = false }
}

export function startAutomationScheduler(intervalMs = 30_000) {
  if (!unsubscribe) unsubscribe = subscribeToAppEvents(handleAppEvent)
  if (scheduler) return false
  scheduler = setInterval(() => {
    void runDueSchedules().catch(error => console.error(`Automation scheduler failed: ${error.message}`))
  }, intervalMs)
  scheduler.unref?.()
  return true
}
