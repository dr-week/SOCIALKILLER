import test from 'node:test'
import assert from 'node:assert/strict'
import { classifyCandidate, parseLineLimit, splitSuggestion } from './monolith-audit.mjs'

test('only reports files at or above the 150-line threshold', () => {
  assert.equal(classifyCandidate('src/small.ts', 149, {}, 149), null)
  assert.deepEqual(classifyCandidate('src/large.ts', 150, {}, 149), {
    file: 'src/large.ts',
    lines: 150,
    status: 'unbaselined',
    baselineLines: undefined
  })
})

test('distinguishes baseline growth from existing oversized files', () => {
  assert.equal(classifyCandidate('src/legacy.ts', 180, { 'src/legacy.ts': 180 }).status, 'legacy')
  assert.equal(classifyCandidate('src/grown.ts', 181, { 'src/grown.ts': 180 }).status, 'grown')
})

test('parses and validates the optional line threshold', () => {
  assert.equal(parseLineLimit([]), 149)
  assert.equal(parseLineLimit(['--over=200']), 200)
  assert.throws(() => parseLineLimit(['--over=0']), /--over must be an integer/)
})

test('suggests a split aligned with the file department', () => {
  assert.match(splitSuggestion('src/features/planner/Planner.vue'), /feature-owned components/)
  assert.match(splitSuggestion('server/routes/social-routes.mjs'), /endpoint groups by feature/)
  assert.match(splitSuggestion('test/workflows.test.mjs'), /tests by behavior/)
})
