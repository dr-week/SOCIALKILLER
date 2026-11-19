import assert from 'node:assert/strict'
import test from 'node:test'
import { postCreationResponse } from './routes/post-creation-response.mjs'

test('reports created approval-queue posts as resource creation, not live publishing', () => {
  assert.deepEqual(postCreationResponse({ id: 'post-1', status: 'pending_approval' }), {
    httpStatus: 201,
    success: true,
    error: null
  })
})

test('maps duplicate, quality, and limit rejections to explicit API errors', () => {
  assert.equal(postCreationResponse({ status: 'skipped_duplicate_token' }).httpStatus, 409)
  assert.equal(postCreationResponse({ status: 'rejected_approval_required' }).httpStatus, 409)
  assert.equal(postCreationResponse({ status: 'rejected_quality_guard' }).httpStatus, 422)
  assert.equal(postCreationResponse({ status: 'skipped_limit' }).httpStatus, 429)
  assert.equal(postCreationResponse({ status: 'unknown' }).success, false)
})
