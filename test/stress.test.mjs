import assert from 'node:assert/strict'
import test from 'node:test'
import http from 'node:http'
import { readFile } from 'node:fs/promises'
import { routeRequest } from '../server/router.mjs'
import { request } from './http-test-utils.mjs'

let testServer = null
let apiPort

test.before(async () => {
  await new Promise((resolve, reject) => {
    testServer = http.createServer(async (req, res) => {
      await routeRequest(req, res)
    })
    testServer.once('error', reject)
    testServer.listen(0, '127.0.0.1', resolve)
  })
  apiPort = testServer.address().port
})

test.after(async () => {
  if (testServer) await new Promise(resolve => testServer.close(resolve))
})

test('STRESS TEST 1: Backend API Health and Account Sync Lifecycle', async () => {
  // 1. Check account list endpoint
  const accountsRes = await request({
    hostname: '127.0.0.1',
    port: apiPort,
    path: '/api/instagram/accounts',
    method: 'GET'
  })
  assert.equal(accountsRes.statusCode, 200)
  assert.ok(Array.isArray(accountsRes.body.accounts))

  // 2. Stress sync with large dataset (5,000 followers & 5,000 following)
  const hugeFollowers = Array.from({ length: 5000 }, (_, i) => ({
    username: `stress_follower_${i}`,
    href: `https://instagram.com/stress_follower_${i}`
  }))
  const hugeFollowing = Array.from({ length: 5000 }, (_, i) => ({
    username: i % 2 === 0 ? `stress_follower_${i}` : `stress_following_${i}`,
    href: `https://instagram.com/stress_following_${i}`
  }))

  const syncRes = await request({
    hostname: '127.0.0.1',
    port: apiPort,
    path: '/api/instagram/sync',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, {
    username: 'stress_test_creator',
    followers: hugeFollowers,
    following: hugeFollowing
  })
  assert.equal(syncRes.statusCode, 200)
  assert.equal(syncRes.body.countFollowers, 5000)
  assert.equal(syncRes.body.countFollowing, 5000)

  // 3. Query relationship for mutual follower
  const mutualRel = await request({
    hostname: '127.0.0.1',
    port: apiPort,
    path: '/api/instagram/relationship?username=stress_follower_0&viewer=stress_test_creator',
    method: 'GET'
  })
  assert.equal(mutualRel.statusCode, 200)
  assert.equal(mutualRel.body.relationship, 'mutual')
  assert.equal(mutualRel.body.followsMe, true)
  assert.equal(mutualRel.body.iFollow, true)

  // 4. Query relationship for unfollower
  const unfollowerRel = await request({
    hostname: '127.0.0.1',
    port: apiPort,
    path: '/api/instagram/relationship?username=stress_following_1&viewer=stress_test_creator',
    method: 'GET'
  })
  assert.equal(unfollowerRel.statusCode, 200)
  assert.equal(unfollowerRel.body.relationship, 'not_following_back')
  assert.equal(unfollowerRel.body.followsMe, false)
  assert.equal(unfollowerRel.body.iFollow, true)

  // 5. Clean up stress account
  const deleteRes = await request({
    hostname: '127.0.0.1',
    port: apiPort,
    path: '/api/instagram/accounts?username=stress_test_creator',
    method: 'DELETE'
  })
  assert.equal(deleteRes.statusCode, 200)
  assert.equal(deleteRes.body.success, true)
})

test('STRESS TEST 2: High-Volume Concurrent Relationship Queries', async () => {
  // Run 100 concurrent relationship checks simultaneously
  const promises = Array.from({ length: 100 }, (_, i) => {
    return request({
      hostname: '127.0.0.1',
      port: apiPort,
      path: `/api/instagram/relationship?username=user_${i}`,
      method: 'GET'
    })
  })

  const results = await Promise.all(promises)
  for (const res of results) {
    assert.equal(res.statusCode, 200)
  }
})

test('STRESS TEST 3: Frontend entry HTML exposes the application mount', async () => {
  const html = await readFile(new URL('../index.html', import.meta.url), 'utf8')
  assert.ok(html.includes('<div id="app"></div>'))
})
