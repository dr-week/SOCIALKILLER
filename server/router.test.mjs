import assert from 'node:assert/strict'
import test from 'node:test'
import { routeRequest } from './router.mjs'
import { saveSyncedData } from './sync-store.mjs'
import { simulateRequest } from './router-test-utils.mjs'

test('health endpoint identifies the active Social Base runtime instance', async () => {
  const response = await simulateRequest(routeRequest, 'GET', '/api/health')
  assert.equal(response.status, 200)
  assert.equal(response.body.status, 'healthy')
  assert.equal(response.body.applicationId, 'the-social-base')
  assert.match(response.body.workspaceId, /^[a-f0-9]{20}$/)
  assert.ok(response.body.instanceId)
  assert.equal(response.body.environment, process.env.APP_ENV || 'development')
  assert.equal(response.body.pid, process.pid)
  assert.equal(response.body.port, Number(process.env.API_PORT || 4174))
})

test('Android status routes expose toolchain readiness and recent build history', async () => {
  const toolchain = await simulateRequest(routeRequest, 'GET', '/api/android/toolchain')
  assert.equal(toolchain.status, 200)
  assert.equal(toolchain.body.toolchain.gradleWrapperAvailable, true)
  assert.ok(Array.isArray(toolchain.body.toolchain.missingPrerequisites))
  const history = await simulateRequest(routeRequest, 'GET', '/api/android/builds')
  assert.equal(history.status, 200)
  assert.ok(Array.isArray(history.body.jobs))
})

test('Instagram relationship endpoints calculate follow status and whitelist state', async () => {
  saveSyncedData({
    username: 'test_viewer',
    followers: [
      { username: 'mutual_pal', href: 'https://instagram.com/mutual_pal' },
      { username: 'fan_user', href: 'https://instagram.com/fan_user' }
    ],
    following: [
      { username: 'mutual_pal', href: 'https://instagram.com/mutual_pal' },
      { username: 'unreciprocated_user', href: 'https://instagram.com/unreciprocated_user' }
    ]
  })

  const mutual = await simulateRequest(routeRequest, 'GET', '/api/instagram/relationship?username=mutual_pal&viewer=test_viewer')
  assert.deepEqual([mutual.body.followsMe, mutual.body.iFollow, mutual.body.relationship], [true, true, 'mutual'])
  const unfollowed = await simulateRequest(routeRequest, 'GET', '/api/instagram/relationship?username=unreciprocated_user&viewer=test_viewer')
  assert.deepEqual([unfollowed.body.followsMe, unfollowed.body.iFollow, unfollowed.body.relationship], [false, true, 'not_following_back'])

  const whitelist = await simulateRequest(routeRequest, 'POST', '/api/instagram/whitelist?username=unreciprocated_user')
  assert.equal(whitelist.body.whitelisted, true)
  const relationship = await simulateRequest(routeRequest, 'GET', '/api/instagram/relationship?username=unreciprocated_user&viewer=test_viewer')
  assert.equal(relationship.body.whitelisted, true)

  const result = await simulateRequest(routeRequest, 'GET', '/api/instagram/unfollowers?username=test_viewer')
  assert.deepEqual([
    result.body.totalFollowers, result.body.totalFollowing, result.body.notFollowingBackCount,
    result.body.notFollowedBackCount, result.body.mutualsCount
  ], [2, 2, 1, 1, 1])
  assert.equal(result.body.notFollowingBack[0].username, 'unreciprocated_user')
  assert.equal(result.body.notFollowedBack[0].username, 'fan_user')
  assert.equal(result.body.mutuals[0].username, 'mutual_pal')
})
