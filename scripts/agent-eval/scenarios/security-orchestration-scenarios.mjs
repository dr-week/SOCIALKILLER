import { Readable } from 'node:stream'
import { routeRequest } from '../../../server/router.mjs'
import { simulateRequest } from '../../../server/router-test-utils.mjs'
import { readJsonBody } from '../../../server/http/read-json.mjs'
import { redactSecrets } from '../../../server/http/logger.mjs'
import { validatePostQuality } from '../../../server/marketing/content-safety-guard.mjs'
import { generateTailoredVariants } from '../../../server/marketing/content-generator.mjs'
import { LuaAutomationEngine } from '../../../server/engine/lua-runner.mjs'

function check(checks) {
  const passed = checks.every(c => c.ok)
  const score = checks.filter(c => c.ok).length / checks.length
  return { passed, score, checks, failureReason: passed ? null : checks.filter(c => !c.ok).map(c => c.name).join(', ') }
}

const PLATFORMS = ['x', 'linkedin', 'reddit', 'github', 'devto', 'discord', 'instagram', 'hashnode', 'medium', 'ai_registry']

export const securityOrchestrationScenarios = [
  {
    id: 'router-foreign-origin-block',
    suite: 'security-ops',
    description: 'Blocks foreign website origins on assistant, social write, and runtime endpoints',
    run: async (ctx) => {
      const headers = { origin: 'https://evil.example' }
      const r1 = await simulateRequest(routeRequest, 'POST', '/api/assistant/ask', { prompt: 'hi' }, headers)
      const r2 = await simulateRequest(routeRequest, 'POST', '/api/social/posts', { title: 'x' }, headers)
      const r3 = await simulateRequest(routeRequest, 'GET', '/api/runtime', null, headers)
      ctx.recordDecision('origin_enforcement', [r1.status, r2.status, r3.status].join(','))
      return [r1.status, r2.status, r3.status]
    },
    evaluate: (statuses) => check([
      { name: 'all_403', ok: statuses.every(s => s === 403) }
    ])
  },
  {
    id: 'http-read-json-bounds',
    suite: 'security-ops',
    description: 'Enforces 413 byte limit and 400 malformed JSON status codes',
    run: async () => {
      let tooLargeStatus = 0
      let badJsonStatus = 0
      try { await readJsonBody(Readable.from([Buffer.from('{"a":"' + 'x'.repeat(80) + '"}')]), 64) }
      catch (err) { tooLargeStatus = err.statusCode || 0 }
      try { await readJsonBody(Readable.from([Buffer.from('{not-json')]), 512) }
      catch (err) { badJsonStatus = err.statusCode || 0 }
      return { tooLargeStatus, badJsonStatus }
    },
    evaluate: (res) => check([
      { name: 'oversized_413', ok: res.tooLargeStatus === 413 },
      { name: 'malformed_400', ok: res.badJsonStatus === 400 }
    ])
  },
  {
    id: 'content-safety-repetition-block',
    suite: 'security-ops',
    description: 'Rejects >65% historical overlap while allowing distinct engineering drafts',
    run: async () => {
      const recent = [{
        id: 'post-1',
        title: 'Local SQLite WAL Architecture Zero Latency',
        topic: 'Local SQLite WAL Architecture',
        variants: { x: 'Local SQLite WAL storage keeps agency data fast without external queues or cloud lock-in.' }
      }]
      const duplicate = validatePostQuality({
        title: 'Local SQLite WAL Architecture Zero Latency',
        topic: 'Local SQLite WAL Architecture',
        body: 'Local SQLite WAL storage keeps agency data fast without external queues or cloud lock-in.',
        historicalPosts: recent
      })
      const distinct = validatePostQuality({
        title: 'Theme Invariant Sobel Contour Matching Benchmarks',
        topic: 'Computer Vision UI Locators',
        body: 'Gradient edge maps normalize contrast between light and dark themes using 2D cross correlation scores.',
        historicalPosts: recent
      })
      return { duplicate, distinct }
    },
    evaluate: ({ duplicate, distinct }) => check([
      { name: 'duplicate_rejected', ok: duplicate.passed === false && duplicate.similarity > 0.65 },
      { name: 'distinct_allowed', ok: distinct.passed === true }
    ])
  },
  {
    id: 'content-generator-platform-contract',
    suite: 'security-ops',
    description: 'Produces non-empty tailored copy for all 10 platforms in default and PAS modes',
    run: async () => ({
      plain: generateTailoredVariants({ topic: 'Zero-Copy Buffers', rawNotes: 'Eliminating GC spikes in real-time visual pipelines.' }),
      pas: generateTailoredVariants({ topic: 'Zero-Copy Buffers', rawNotes: 'Eliminating GC spikes cleanly.', viralFramework: 'PAS' })
    }),
    evaluate: ({ plain, pas }) => check([
      { name: 'plain_all_10', ok: PLATFORMS.every(k => typeof plain[k] === 'string' && plain[k].trim().length > 10) },
      { name: 'pas_all_10', ok: PLATFORMS.every(k => typeof pas[k] === 'string' && pas[k].trim().length > 10) }
    ])
  },
  {
    id: 'lua-runner-simulation-boundary',
    suite: 'security-ops',
    description: 'Stays strictly simulation-only and halts above hourly quota limit',
    run: async () => {
      const engine = new LuaAutomationEngine({ quotaLimitPerHour: 2 })
      const preview = await engine.runScript([{ action: 'find', target: 'heart' }, { action: 'type', text: 'a' }, { action: 'type', text: 'b' }])
      let quotaBlocked = false
      try { await engine.humanType('overflow') } catch (e) { quotaBlocked = /Safety Quota Exceeded/i.test(e.message) }
      return { preview, quotaBlocked }
    },
    evaluate: ({ preview, quotaBlocked }) => check([
      { name: 'simulation_mode', ok: preview.mode === 'simulation_only' && preview.results[0]?.found === false },
      { name: 'quota_enforced', ok: quotaBlocked }
    ])
  },
  {
    id: 'logger-secret-redaction',
    suite: 'security-ops',
    description: 'Redacts credentials, tokens, and webhooks while retaining operational fields',
    run: async () => redactSecrets({
      brandId: 'danger-labs',
      latencyMs: 14,
      apiKey: 'secret-value',
      nested: { authorization: 'Bearer topsecret123', tokenLine: 'ghp_1234567890abcdef', webhookUrl: 'https://discord.com/api/webhooks/1/abc' }
    }),
    evaluate: (clean) => check([
      { name: 'secrets_redacted', ok: clean.apiKey === '[REDACTED]' && clean.nested.authorization === '[REDACTED]' && clean.nested.webhookUrl === '[REDACTED]' },
      { name: 'prefix_redacted', ok: clean.nested.tokenLine === '[REDACTED]' },
      { name: 'safe_fields_preserved', ok: clean.brandId === 'danger-labs' && clean.latencyMs === 14 }
    ])
  }
]
