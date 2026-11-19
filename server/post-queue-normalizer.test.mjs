import assert from 'node:assert/strict'
import test from 'node:test'
import { normalizeQueuedPost } from './marketing/post-queue-normalizer.mjs'

test('recovers missing channels from recorded delivery history', () => {
  const normalized = normalizeQueuedPost({
    deliveryLogs: [
      { platformId: 'x' },
      { platformId: 'discord' },
      { platformId: 'x' },
      { platformId: 'unknown' }
    ]
  })

  assert.deepEqual(normalized.platforms, ['x', 'discord'])
  assert.equal(normalized.metadataWarning, undefined)
})

test('warns when a legacy post has no channel metadata or delivery history', () => {
  const normalized = normalizeQueuedPost({ deliveryLogs: [] })

  assert.deepEqual(normalized.platforms, [])
  assert.match(normalized.metadataWarning, /editing, approving, duplicating, or confirming/)
})

test('preserves explicit channel selections', () => {
  const post = { platforms: ['linkedin'], deliveryLogs: [{ platformId: 'x' }] }

  assert.equal(normalizeQueuedPost(post), post)
})

test('rejects invalid queue entries instead of hiding them', () => {
  assert.throws(() => normalizeQueuedPost(null), /must be an object/)
})
