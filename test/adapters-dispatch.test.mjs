import { describe, it } from 'node:test'
import assert from 'node:assert'
import { executePlatformDelivery } from '../server/marketing/dispatcher.mjs'

describe('Comprehensive Social Adapters Mock Dispatch & Reliability Suite', () => {
  const adapters = [
    { platformId: 'x', label: 'X (Twitter)' },
    { platformId: 'instagram', label: 'Instagram' },
    { platformId: 'linkedin', label: 'LinkedIn' },
    { platformId: 'reddit', label: 'Reddit' },
    { platformId: 'discord', label: 'Discord' },
    { platformId: 'github', label: 'GitHub' },
    { platformId: 'devto', label: 'Dev.to' },
    { platformId: 'hashnode', label: 'Hashnode' },
    { platformId: 'medium', label: 'Medium' }
  ]

  it('formats payload cleanly for all 9 adapters without credentials (browser-assisted fallback)', async () => {
    for (const { platformId, label } of adapters) {
      const res = await executePlatformDelivery(
        platformId,
        'Testing autonomous dispatch with clean formatting across channels.',
        'Architecture Update v1.0',
        { credentials: {} }
      )
      assert.strictEqual(res.platformId, platformId, `Platform mismatch for ${label}`)
      assert.ok(
        res.status === 'simulated_or_ready' || res.status === 'published_live',
        `Unexpected status for ${label}: ${res.status}`
      )
      assert.ok(res.intentUrl || res.externalUrl, `Expected intentUrl or externalUrl for ${label}`)
      assert.ok(res.message.length > 0, `Expected delivery message for ${label}`)
    }
  })

  it('handles remote network drops and upstream errors cleanly without unhandled crashes', async () => {
    const originalFetch = global.fetch
    try {
      global.fetch = async () => {
        throw new Error('ETIMEDOUT: Connection timed out to remote gateway')
      }

      const errDiscord = await executePlatformDelivery('discord', 'Timeout payload', 'Title', {
        credentials: { webhookUrl: 'https://discord.com/api/webhooks/fail' }
      })
      assert.ok(errDiscord.status === 'simulated_or_ready' || errDiscord.status === 'error')

      const errGithub = await executePlatformDelivery('github', 'Timeout payload', 'Title', {
        credentials: { personalAccessToken: 'failing_token' }
      })
      assert.ok(errGithub.status === 'simulated_or_ready' || errGithub.status === 'error')

      const errDevto = await executePlatformDelivery('devto', 'Timeout payload', 'Title', {
        credentials: { apiKey: 'failing_key' }
      })
      assert.ok(errDevto.status === 'simulated_or_ready' || errDevto.status === 'error')

      const errX = await executePlatformDelivery('x', 'Timeout payload', 'Title', {
        credentials: { accessToken: 'failing_token' }
      })
      assert.strictEqual(errX.status, 'simulated_or_ready')
      assert.strictEqual(errX.mode, 'intent_assisted')

      const errReddit = await executePlatformDelivery('reddit', 'Timeout payload', 'Title', {
        credentials: { accessToken: 'failing_token' }
      })
      assert.strictEqual(errReddit.status, 'simulated_or_ready')
      assert.strictEqual(errReddit.mode, 'intent_assisted')

      const errLinkedin = await executePlatformDelivery('linkedin', 'Timeout payload', 'Title', {
        credentials: { accessToken: 'failing_token', authorUrn: 'urn:li:person:fail' }
      })
      assert.strictEqual(errLinkedin.status, 'simulated_or_ready')
      assert.strictEqual(errLinkedin.mode, 'intent_assisted')
    } finally {
      global.fetch = originalFetch
    }
  })
})
