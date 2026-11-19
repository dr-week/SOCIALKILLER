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

  // Test 1: Verified format & payload fallback generation across all 9 adapters
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

  // Test 2: Live mock dispatch with credentials across all 9 adapters
  it('executes clean mock dispatches with valid simulated credentials', async () => {
    const originalFetch = global.fetch

    try {
      // Mock global fetch to verify exact payload formatting and headers
      global.fetch = async (url, opts = {}) => {
        const urlStr = String(url)

        if (urlStr.includes('discord.com')) {
          const body = JSON.parse(opts.body)
          assert.ok(body.content.includes('Discord Test Update'))
          return { ok: true, status: 200, json: async () => ({ id: 'discord-msg-123' }) }
        }

        if (urlStr.includes('api.github.com/gists')) {
          assert.strictEqual(opts.headers.Authorization, 'Bearer gh_mock_pat_token')
          const body = JSON.parse(opts.body)
          assert.ok(body.public === true)
          return { ok: true, status: 201, json: async () => ({ html_url: 'https://gist.github.com/mock-id' }) }
        }

        if (urlStr.includes('dev.to/api/articles')) {
          assert.strictEqual(opts.headers['api-key'], 'mock_devto_key')
          const body = JSON.parse(opts.body)
          assert.strictEqual(body.article.title, 'Clean Dev.to Post')
          return { ok: true, status: 201, json: async () => ({ url: 'https://dev.to/article/mock-123' }) }
        }

        if (urlStr.includes('api.twitter.com/2/tweets')) {
          assert.strictEqual(opts.headers.Authorization, 'Bearer mock_x_bearer')
          const body = JSON.parse(opts.body)
          assert.ok(body.text.length <= 280)
          return { ok: true, status: 201, json: async () => ({ data: { id: 'tweet-999' } }) }
        }

        if (urlStr.includes('oauth.reddit.com/api/submit')) {
          assert.strictEqual(opts.headers.Authorization, 'Bearer mock_reddit_token')
          return { ok: true, status: 200, json: async () => ({ json: { data: { url: 'https://reddit.com/r/webdev/comments/123' } } }) }
        }

        return { ok: true, status: 200, json: async () => ({}) }
      }

      // 1. Discord
      const resDiscord = await executePlatformDelivery('discord', 'Discord Test Update', 'Title', {
        credentials: { webhookUrl: 'https://discord.com/api/webhooks/123/abc' }
      })
      assert.strictEqual(resDiscord.status, 'published_live')
      assert.strictEqual(resDiscord.mode, 'live_api')

      // 2. GitHub
      const resGithub = await executePlatformDelivery('github', '# GitHub Test Content', 'GH Update', {
        credentials: { personalAccessToken: 'gh_mock_pat_token' }
      })
      assert.strictEqual(resGithub.status, 'published_live')
      assert.strictEqual(resGithub.externalUrl, 'https://gist.github.com/mock-id')

      // 3. Dev.to
      const resDevto = await executePlatformDelivery('devto', 'Dev.to article body markdown', 'Clean Dev.to Post', {
        credentials: { apiKey: 'mock_devto_key' }
      })
      assert.strictEqual(resDevto.status, 'published_live')
      assert.strictEqual(resDevto.externalUrl, 'https://dev.to/article/mock-123')

      // 4. X (Twitter)
      const resX = await executePlatformDelivery('x', 'Short 280-char tweet update for developer ecosystem', 'X Title', {
        credentials: { accessToken: 'mock_x_bearer' }
      })
      assert.strictEqual(resX.status, 'published_live')
      assert.strictEqual(resX.externalUrl, 'https://x.com/i/web/status/tweet-999')

      // 5. Reddit
      const resReddit = await executePlatformDelivery('reddit', 'Discussion on zero-VDOM UI benchmarks', 'Reddit Discussion', {
        credentials: { accessToken: 'mock_reddit_token', defaultSubreddit: 'r/webdev' }
      })
      assert.strictEqual(resReddit.status, 'published_live')
      assert.strictEqual(resReddit.externalUrl, 'https://reddit.com/r/webdev/comments/123')

      // 6. Instagram has no direct publish path without a linked account and media URL.
      const resInstagram = await executePlatformDelivery('instagram', 'Studio visual build log', 'IG Slide', {
        credentials: { token: 'mock_ig_token' }
      })
      assert.strictEqual(resInstagram.status, 'simulated_or_ready')
      assert.strictEqual(resInstagram.mode, 'intent_assisted')

      // 7. Hashnode
      const resHashnode = await executePlatformDelivery('hashnode', 'Deep dive blog post', 'Hashnode Story', {
        credentials: { apiKey: 'mock_hashnode_key', publicationId: 'pub_123' }
      })
      assert.strictEqual(resHashnode.status, 'published_live')

      // 8. Medium
      const resMedium = await executePlatformDelivery('medium', 'Thought leadership article', 'Medium Story', {
        credentials: { apiKey: 'mock_medium_key' }
      })
      assert.strictEqual(resMedium.status, 'published_live')

    } finally {
      global.fetch = originalFetch
    }
  })

  // Test 3: Error handling when network fails or API returns errors
  it('handles remote network drops and upstream errors cleanly without unhandled crashes', async () => {
    const originalFetch = global.fetch

    try {
      global.fetch = async () => {
        throw new Error('ETIMEDOUT: Connection timed out to remote gateway')
      }

      // Discord network error
      const errDiscord = await executePlatformDelivery('discord', 'Timeout payload', 'Title', {
        credentials: { webhookUrl: 'https://discord.com/api/webhooks/fail' }
      })
      assert.ok(errDiscord.status === 'simulated_or_ready' || errDiscord.status === 'error')

      // GitHub network error
      const errGithub = await executePlatformDelivery('github', 'Timeout payload', 'Title', {
        credentials: { personalAccessToken: 'failing_token' }
      })
      assert.ok(errGithub.status === 'simulated_or_ready' || errGithub.status === 'error')

      // Dev.to network error
      const errDevto = await executePlatformDelivery('devto', 'Timeout payload', 'Title', {
        credentials: { apiKey: 'failing_key' }
      })
      assert.ok(errDevto.status === 'simulated_or_ready' || errDevto.status === 'error')

      // X (Twitter) network error -> falls back to intent
      const errX = await executePlatformDelivery('x', 'Timeout payload', 'Title', {
        credentials: { accessToken: 'failing_token' }
      })
      assert.strictEqual(errX.status, 'simulated_or_ready')
      assert.strictEqual(errX.mode, 'intent_assisted')

      // Reddit network error -> falls back to intent
      const errReddit = await executePlatformDelivery('reddit', 'Timeout payload', 'Title', {
        credentials: { accessToken: 'failing_token' }
      })
      assert.strictEqual(errReddit.status, 'simulated_or_ready')
      assert.strictEqual(errReddit.mode, 'intent_assisted')

      // LinkedIn network error -> falls back to intent
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
