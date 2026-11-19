import assert from 'node:assert/strict'
import test from 'node:test'
import { parseProfileFollowerCount } from './profile-parser.mjs'

test('reads exact counts from description metadata', () => {
  assert.deepEqual(parseProfileFollowerCount('<meta name="description" content="8,268 Followers on Instagram">', 'sample'), {
    value: 8268, display: '8,268', precision: 'exact',
  })
})

test('reads Open Graph description when standard description is absent', () => {
  assert.deepEqual(parseProfileFollowerCount('<meta property="og:description" content="1.2M Followers">', 'sample'), {
    value: 1_200_000, display: '1.2M', precision: 'approximate',
  })
})

test('falls back to embedded public profile count for the requested username', () => {
  assert.deepEqual(parseProfileFollowerCount('<script>{"username":"sample","follower_count":8268}</script>', 'sample'), {
    value: 8268, display: '8,268', precision: 'exact',
  })
})

test('does not use an embedded count from a different account', () => {
  assert.equal(parseProfileFollowerCount('<script>{"username":"other","follower_count":8268}</script>', 'sample'), null)
})
