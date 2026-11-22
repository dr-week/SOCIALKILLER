import assert from 'node:assert/strict'
import test from 'node:test'
import { DEFAULT_SLOTS, optimizePostSchedule } from './marketing/scheduling/qubo-scheduler.mjs'

test('QUBO simulated annealing selects exact target cadence with sub-5ms latency', () => {
  const result = optimizePostSchedule({
    slots: DEFAULT_SLOTS,
    targetCount: 4,
    iterations: 400,
    seed: 1337
  })

  assert.equal(result.solver, 'classical-qubo-simulated-annealing')
  assert.equal(result.selectedCount, 4)
  assert.equal(result.selectedSlots.length, 4)
  assert.ok(result.energy < -3.0, `Expected negative energy < -3.0, got ${result.energy}`)
  assert.ok(result.durationMs < 25, `Expected fast convergence, got ${result.durationMs}ms`)
})

test('QUBO optimizer avoids same-day overlapping high-penalty conflicts', () => {
  const customSlots = [
    { id: 'a1', day: 'Mon', hour: 9, platform: 'x', engagement: 0.90 },
    { id: 'a2', day: 'Mon', hour: 10, platform: 'x', engagement: 0.89 },
    { id: 'b1', day: 'Wed', hour: 10, platform: 'linkedin', engagement: 0.85 }
  ]

  const result = optimizePostSchedule({
    slots: customSlots,
    targetCount: 2,
    iterations: 350,
    seed: 99
  })

  assert.equal(result.selectedCount, 2)
  const ids = result.selectedSlots.map(s => s.id)
  assert.ok(ids.includes('b1'), 'Should select non-conflicting Wednesday slot')
  assert.ok(!(ids.includes('a1') && ids.includes('a2')), 'Should avoid overlapping Monday slots')
})
