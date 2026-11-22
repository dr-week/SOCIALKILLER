import assert from 'node:assert/strict'
import test from 'node:test'
import { buildSmartUnfollowBatch } from '../src/domain/smart-unfollow.ts'

test('buildSmartUnfollowBatch auto-protects whitelisted, recent follows, and creator handles', () => {
  const nowSec = 1_700_000_000
  const candidates = [
    { username: 'safe_friend', href: '', timestamp: nowSec - 60 * 86400 },
    { username: 'new_follow_2d', href: '', timestamp: nowSec - 2 * 86400 },
    { username: 'acme_studio', href: '', timestamp: nowSec - 45 * 86400 },
    { username: 'ghost_998877', href: '', timestamp: nowSec - 50 * 86400 },
    { username: 'dead_account', href: '', timestamp: nowSec - 40 * 86400 }
  ]

  const statusMap = new Map([['dead_account', { status: 'deactivated', reason: '404' }]])
  const result = buildSmartUnfollowBatch({
    candidates,
    ghostUsernames: new Set(['ghost_998877']),
    whitelistSet: new Set(['safe_friend']),
    accountStatusMap: statusMap,
    nowSec
  })

  assert.equal(result.protectedCount, 3)
  assert.equal(result.totalEligible, 2)
  assert.equal(result.batch[0].person.username, 'dead_account')
  assert.equal(result.batch[1].person.username, 'ghost_998877')
})

test('buildSmartUnfollowBatch respects ghostsOnly filter and batchSize cap', () => {
  const candidates = [
    { username: 'regular_user', href: '' },
    { username: 'ghost_1', href: '' },
    { username: 'ghost_2', href: '' }
  ]

  const result = buildSmartUnfollowBatch({
    candidates,
    ghostUsernames: new Set(['ghost_1', 'ghost_2']),
    whitelistSet: new Set(),
    rules: { ghostsOnly: true, batchSize: 1, protectCreators: false }
  })

  assert.equal(result.totalEligible, 2)
  assert.equal(result.batch.length, 1)
  assert.equal(result.batch[0].person.username, 'ghost_1')
})
