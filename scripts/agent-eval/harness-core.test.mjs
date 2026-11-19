import assert from 'node:assert/strict'
import test from 'node:test'
import { computeBaselineDiff, formatScorecard, runEvalSuite } from './harness-core.mjs'

test('captures execution traces, tool calls, decisions, and aggregate score', async () => {
  const report = await runEvalSuite([
    {
      id: 'trace-ok', suite: 'demo', description: 'Tracks tool and decision',
      run: async (ctx) => {
        ctx.log('start', 'init')
        ctx.recordTool('summarizer', { chars: 10 }, { ok: true }, 2)
        ctx.recordDecision('route', 'draft')
        return 'done'
      },
      evaluate: (out, trace) => ({
        passed: out === 'done' && trace.toolCalls.length === 1 && trace.decisions[0].outcome === 'draft',
        score: 1,
        checks: [{ name: 'output', ok: true }]
      })
    }
  ])
  assert.equal(report.passed, 1)
  assert.equal(report.avgScore, 1)
  assert.equal(report.results[0].trace.logs.length, 1)
  assert.match(formatScorecard(report), /1\/1 passed/)
})

test('enforces scenario timeout and records diagnostic failure', async () => {
  const report = await runEvalSuite([
    {
      id: 'slow-op', suite: 'demo', description: 'Times out', timeoutMs: 25,
      run: () => new Promise(resolve => setTimeout(() => resolve('late'), 200)),
      evaluate: () => ({ passed: true, score: 1, checks: [] })
    }
  ])
  assert.equal(report.failed, 1)
  assert.match(report.results[0].failureReason, /timed out/)
})

test('retries transient error up to maxRetries and filters suites', async () => {
  let calls = 0
  const scenarios = [
    {
      id: 'retry-ok', suite: 'alpha', description: 'Recovers on attempt 2', maxRetries: 1,
      run: async () => { if (++calls === 1) throw new Error('blip'); return 'recovered' },
      evaluate: (out) => ({ passed: out === 'recovered', score: 1, checks: [{ name: 'recovered', ok: true }] })
    },
    { id: 'other', suite: 'beta', description: 'Skipped', run: async () => 'x', evaluate: async () => ({ passed: true, score: 1, checks: [] }) }
  ]
  const report = await runEvalSuite(scenarios, { suiteFilter: 'alpha' })
  assert.equal(report.total, 1)
  assert.equal(report.passed, 1)
  assert.equal(report.totalRetries, 1)
})

test('computeBaselineDiff identifies new regressions and pass-rate deltas', () => {
  const diff = computeBaselineDiff(
    { passRate: 1, p95LatencyMs: 10, results: [{ id: 's1', passed: true }, { id: 's2', passed: true }] },
    { passRate: 0.5, p95LatencyMs: 18, results: [{ id: 's1', passed: true }, { id: 's2', passed: false }] }
  )
  assert.deepEqual(diff, { previousPassRate: 1, passRateDelta: -0.5, p95DeltaMs: 8, newRegressions: ['s2'] })
})
