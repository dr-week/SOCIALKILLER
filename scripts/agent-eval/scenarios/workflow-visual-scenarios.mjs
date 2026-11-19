import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { DatabaseSync } from 'node:sqlite'
import { createAutomationEngine } from '../../../server/automation/automation-engine.mjs'
import { normalizeAutomationDefinition } from '../../../server/automation/automation-definition.mjs'
import { createAutomationRepository } from '../../../server/automation/automation-repository.mjs'
import { initializeAutomationSchema } from '../../../server/db/schema-automation.mjs'
import { computeSobelEdges, rgbaToGrayscale, synthesizeIconEdgeMap, matchTemplateEdge } from '../../../server/engine/vision-contour.mjs'
import { computeHumanJitterMs } from '../../../extension/modules/human-cadence.js'

function check(checks) {
  const passed = checks.every(c => c.ok)
  const score = checks.filter(c => c.ok).length / checks.length
  return { passed, score, checks, failureReason: passed ? null : checks.filter(c => !c.ok).map(c => c.name).join(', ') }
}

function makeRule(extra = {}) {
  return normalizeAutomationDefinition({
    name: 'Agent Eval Rule', triggerType: 'social.post.created',
    conditions: [{ field: 'event.platformId', operator: 'equals', value: 'x' }],
    actions: [
      { type: 'create_social_draft', topic: 'Step 1', notes: 'First', platformIds: ['x'] },
      { type: 'create_social_draft', topic: 'Step 2', notes: 'Second', platformIds: ['linkedin'] }
    ], ...extra
  }, 'brand-eval', 'rule-eval', true)
}

export const workflowVisualScenarios = [
  {
    id: 'automation-partial-failure-retry', suite: 'workflow-visual',
    description: 'Automation retry resumes at failed step 2 without repeating step 1',
    run: async (ctx) => {
      const db = new DatabaseSync(':memory:')
      db.exec('PRAGMA foreign_keys = ON')
      initializeAutomationSchema(db)
      try {
        const repo = createAutomationRepository(db)
        const rule = repo.saveRule(makeRule())
        let step1 = 0
        let step2 = 0
        const engine = createAutomationEngine(repo, async (_a, c) => {
          if (c.actionIndex === 0) step1++
          if (c.actionIndex === 1 && step2++ === 0) throw new Error('Transient step-2 outage')
          return { id: `draft-${c.actionIndex}`, status: 'draft' }
        })
        const failed = await engine.run(rule, { platformId: 'x' }, 'evt-1')
        const failedStatus = failed.status
        const failedActionCount = failed.actionResults.length
        ctx.recordDecision('first_run', failedStatus)
        const retried = await engine.retry(failed, rule)
        ctx.recordDecision('retry_run', retried.status)
        return { failedStatus, failedActionCount, retried, step1, step2 }
      } finally { db.close() }
    },
    evaluate: ({ failedStatus, failedActionCount, retried, step1, step2 }) => check([
      { name: 'failed_on_first', ok: failedStatus === 'failed' && failedActionCount === 1 },
      { name: 'succeeded_on_retry', ok: retried.status === 'succeeded' && retried.actionResults.length === 2 },
      { name: 'no_duplicate_step1', ok: step1 === 1 && step2 === 2 }
    ])
  },
  {
    id: 'automation-draft-only-safety', suite: 'workflow-visual',
    description: 'Normalization rejects non-draft actions and <15m schedules',
    run: async () => {
      const errors = []
      try { makeRule({ actions: [{ type: 'send_email' }] }) } catch (e) { errors.push(e.message) }
      try { makeRule({ triggerType: 'schedule', triggerConfig: { intervalMinutes: 2 } }) } catch (e) { errors.push(e.message) }
      return errors
    },
    evaluate: (errors) => check([
      { name: 'send_email_blocked', ok: /draft/i.test(errors[0] || '') },
      { name: 'short_schedule_blocked', ok: /15 minutes/i.test(errors[1] || '') }
    ])
  },
  {
    id: 'automation-unmatched-else-branch', suite: 'workflow-visual',
    description: 'Executes elseActions when conditions do not match',
    run: async () => {
      const db = new DatabaseSync(':memory:')
      initializeAutomationSchema(db)
      try {
        const repo = createAutomationRepository(db)
        const rule = repo.saveRule(makeRule({ elseActions: [{ type: 'create_social_draft', topic: 'Fallback', platformIds: ['reddit'] }] }))
        const engine = createAutomationEngine(repo, async action => ({ id: action.topic, status: 'draft' }))
        return await engine.run(rule, { platformId: 'instagram' }, 'evt-else')
      } finally { db.close() }
    },
    evaluate: (res) => check([
      { name: 'unmatched_succeeded', ok: res.status === 'succeeded' && res.actionResults[0]?.branch === 'unmatched' },
      { name: 'fallback_created', ok: res.actionResults[0]?.result?.id === 'Fallback' }
    ])
  },
  {
    id: 'visual-bot-sobel-theme-invariance', suite: 'workflow-visual',
    description: 'Sobel edge + 2D NCC matches shapes identically across dark & light themes',
    run: async () => {
      const heart = synthesizeIconEdgeMap('heart', 16, 16)
      const renderEdges = (bg, fg) => {
        const rgba = new Uint8ClampedArray(32 * 32 * 4)
        for (let y = 0; y < 32; y++) for (let x = 0; x < 32; x++) {
          const i = (y * 32 + x) * 4
          const v = (x >= 10 && x < 22 && y >= 10 && y < 22) ? fg : bg
          rgba[i] = rgba[i + 1] = rgba[i + 2] = v; rgba[i + 3] = 255
        }
        const edges = computeSobelEdges(rgbaToGrayscale(rgba, 32, 32), 32, 32)
        return { edges, match: matchTemplateEdge(edges, 32, 32, heart, 16, 16, 0.1) }
      }
      return { dark: renderEdges(20, 235), light: renderEdges(235, 20) }
    },
    evaluate: ({ dark, light }) => {
      let maxDiff = 0
      for (let i = 0; i < dark.edges.length; i++) maxDiff = Math.max(maxDiff, Math.abs(dark.edges[i] - light.edges[i]))
      return check([
        { name: 'sobel_edges_identical', ok: maxDiff < 0.05 },
        { name: 'theme_invariant_confidence', ok: Math.abs(dark.match.confidence - light.match.confidence) < 0.01 }
      ])
    }
  },
  {
    id: 'visual-bot-cadence-human-bounds',
    suite: 'workflow-visual',
    description: 'Box-Muller cognitive jitter stays safely bounded with natural variance',
    run: async () => Array.from({ length: 50 }, () => computeHumanJitterMs(140, 50)),
    evaluate: (samples) => check([
      { name: 'bounded_range', ok: samples.every(ms => ms >= 45 && ms <= 1000) },
      { name: 'natural_variance', ok: new Set(samples).size > 5 }
    ])
  },
  {
    id: 'visual-bot-unsafe-action-gate',
    suite: 'workflow-visual',
    description: 'Extension interaction-recorder blocks unsafe submit/publish/payment labels',
    run: async () => {
      const src = await readFile(resolve('extension/modules/interaction-recorder.js'), 'utf8')
      const match = src.match(/const UNSAFE_ACTION = (\/.*\/[gimsuy]*)/)
      if (!match) return { found: false, blocked: [], allowed: [] }
      const regex = new RegExp(match[1].slice(1, match[1].lastIndexOf('/')), match[1].slice(match[1].lastIndexOf('/') + 1))
      const unsafe = ['Publish post', 'Pay now', 'Delete account', 'Follow creator', 'Submit form']
      const safe = ['Open drawer', 'Preview draft', 'Filter queue', 'Switch brand']
      return { found: true, blocked: unsafe.map(l => regex.test(l)), allowed: safe.map(l => !regex.test(l)) }
    },
    evaluate: (res) => check([
      { name: 'regex_present', ok: res.found },
      { name: 'all_unsafe_blocked', ok: res.blocked.length === 5 && res.blocked.every(Boolean) },
      { name: 'all_safe_allowed', ok: res.allowed.length === 4 && res.allowed.every(Boolean) }
    ])
  }
]
