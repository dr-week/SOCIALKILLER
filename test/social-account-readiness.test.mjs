import assert from 'node:assert/strict'
import test from 'node:test'
import {
  getPublishingReadiness,
  isReadyForImmediatePublishing
} from '../src/features/social-accounts/domain/publishing-readiness.ts'

test('saved credentials require a successful connection test before immediate publish', () => {
  const configured = { id: 'instagram', isConfigured: true }
  assert.equal(getPublishingReadiness(configured), 'verification-required')
  assert.equal(isReadyForImmediatePublishing(configured), false)
  assert.equal(isReadyForImmediatePublishing({ ...configured, connectionVerified: true }), true)
})

test('missing credentials cannot be made ready by a stale verification flag', () => {
  assert.equal(getPublishingReadiness({
    id: 'linkedin', isConfigured: false, connectionVerified: true
  }), 'unconfigured')
})

test('the built-in catalog remains ready without a channel connection', () => {
  assert.equal(getPublishingReadiness({ id: 'ai_registry' }), 'ready')
})
