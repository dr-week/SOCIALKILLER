import test from 'node:test'
import assert from 'node:assert/strict'
import { saveSyncedData, getSyncedData, getAllSyncedAccounts } from './sync-store.mjs'

test('sync-store maintains multiple profile accounts independently', () => {
  saveSyncedData({
    username: 'hyperdrive_studio',
    followers: [{ username: 'f1' }, { username: 'f2' }],
    following: [{ username: 'f1' }]
  })

  saveSyncedData({
    username: 'sidequest_ceo',
    followers: [{ username: 'boss1' }],
    following: [{ username: 'boss1' }, { username: 'boss2' }]
  })

  const hd = getSyncedData('hyperdrive_studio')
  const sq = getSyncedData('sidequest_ceo')

  assert.equal(hd?.username, 'hyperdrive_studio')
  assert.equal(hd?.followers.length, 2)
  assert.equal(sq?.username, 'sidequest_ceo')
  assert.equal(sq?.following.length, 2)

  const all = getAllSyncedAccounts()
  assert.equal(all.length >= 2, true)
  assert.ok(all.some(a => a.username === 'hyperdrive_studio'))
  assert.ok(all.some(a => a.username === 'sidequest_ceo'))
})

test('sync-store supports partial syncs and account removal', async () => {
  const { removeSyncedAccount } = await import('./sync-store.mjs')
  saveSyncedData({
    username: 'temporary_user',
    followers: [{ username: 'tmp' }],
    following: [],
    partial: true
  })

  const temp = getSyncedData('temporary_user')
  assert.equal(temp?.partial, true)

  const deleted = removeSyncedAccount('temporary_user')
  assert.equal(deleted, true)
  assert.equal(getSyncedData('temporary_user'), null)
})
