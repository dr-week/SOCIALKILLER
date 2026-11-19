import assert from 'node:assert/strict'
import test from 'node:test'
import { inspectPhases, inspectSources } from './check-plan.mjs'

const source = {
  id: 'buffer',
  product: 'Buffer',
  url: 'https://buffer.com/publish',
  sourceType: 'official product page',
  reviewedOn: '2026-11-04',
  evidence: 'Calendar and channel editing.',
  designTakeaway: 'Keep channel edits near the shared draft.',
  limitations: 'Vendor page, not a usability test.'
}

test('validates research evidence and reports stale review dates', () => {
  const fresh = inspectSources([source], new Date('2026-11-04T12:00:00Z'))
  assert.deepEqual(fresh.errors, [])
  assert.deepEqual(fresh.stale, [])

  const stale = inspectSources([{ ...source, reviewedOn: '2026-01-01' }], new Date('2026-11-04T12:00:00Z'))
  assert.deepEqual(stale.errors, [])
  assert.equal(stale.stale[0].id, 'buffer')
})

test('rejects invalid source URLs and missing evidence', () => {
  const result = inspectSources([{ ...source, url: 'http://example.com', evidence: '' }])
  assert.ok(result.errors.some(error => error.includes('https URL')))
  assert.ok(result.errors.some(error => error.includes('evidence')))
})

test('reports the ready phase and waits for unfinished prerequisites', () => {
  const phases = [
    { id: 'research', title: 'Research', status: 'proposed', dependsOn: [], exitCriteria: 'Baseline.' },
    { id: 'responsive', title: 'Responsive', status: 'proposed', dependsOn: ['research'], exitCriteria: 'No overflow.' }
  ]
  const result = inspectPhases(phases)
  assert.deepEqual(result.errors, [])
  assert.deepEqual(result.readiness, [
    { id: 'research', state: 'ready', waitingOn: [] },
    { id: 'responsive', state: 'waiting', waitingOn: ['research'] }
  ])
})

test('rejects unknown roadmap dependencies and cycles', () => {
  const phases = [
    { id: 'first', title: 'First', status: 'proposed', dependsOn: ['second'], exitCriteria: 'Done.' },
    { id: 'second', title: 'Second', status: 'proposed', dependsOn: ['first', 'missing'], exitCriteria: 'Done.' }
  ]
  const result = inspectPhases(phases)
  assert.ok(result.errors.some(error => error.includes('unknown phase missing')))
  assert.ok(result.errors.some(error => error.includes('dependency cycle')))
})
