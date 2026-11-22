import { describe, it } from 'node:test'
import assert from 'node:assert'
import { executePlatformDelivery } from '../server/marketing/dispatcher.mjs'

describe('Social Adapters Live Mock Dispatch Suite', () => {
  it('executes clean mock dispatches with valid simulated credentials', async () => {
    const originalFetch = global.fetch
    try {
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

      const resDiscord = await executePlatformDelivery('discord', 'Discord Test Update', 'Title', {
        credentials: { webhookUrl: 'https://discord.com/api/webhooks/123/abc' }
      })
      assert.strictEqual(resDiscord.status, 'published_live')
      assert.strictEqual(resDiscord.mode, 'live_api')

      const resGithub = await executePlatformDelivery('github', '# GitHub Test Content', 'GH Update', {
        credentials: { personalAccessToken: 'gh_mock_pat_token' }
      })
      assert.strictEqual(resGithub.status, 'published_live')
      assert.strictEqual(resGithub.externalUrl, 'https://gist.github.com/mock-id')

      const resDevto = await executePlatformDelivery('devto', 'Dev.to article body markdown', 'Clean Dev.to Post', {
        credentials: { apiKey: 'mock_devto_key' }
      })
      assert.strictEqual(resDevto.status, 'published_live')
      assert.strictEqual(resDevto.externalUrl, 'https://dev.to/article/mock-123')

      const resX = await executePlatformDelivery('x', 'Short 280-char tweet update for developer ecosystem', 'X Title', {
        credentials: { accessToken: 'mock_x_bearer' }
      })
      assert.strictEqual(resX.status, 'published_live')
      assert.strictEqual(resX.externalUrl, 'https://x.com/i/web/status/tweet-999')

      const resReddit = await executePlatformDelivery('reddit', 'Discussion on zero-VDOM UI benchmarks', 'Reddit Discussion', {
        credentials: { accessToken: 'mock_reddit_token', defaultSubreddit: 'r/webdev' }
      })
      assert.strictEqual(resReddit.status, 'published_live')
      assert.strictEqual(resReddit.externalUrl, 'https://reddit.com/r/webdev/comments/123')

      const resInstagram = await executePlatformDelivery('instagram', 'Studio visual build log', 'IG Slide', {
        credentials: { token: 'mock_ig_token' }
      })
      assert.strictEqual(resInstagram.status, 'simulated_or_ready')
      assert.strictEqual(resInstagram.mode, 'intent_assisted')

      const resHashnode = await executePlatformDelivery('hashnode', 'Deep dive blog post', 'Hashnode Story', {
        credentials: { apiKey: 'mock_hashnode_key', publicationId: 'pub_123' }
      })
      assert.strictEqual(resHashnode.status, 'published_live')

      const resMedium = await executePlatformDelivery('medium', 'Thought leadership article', 'Medium Story', {
        credentials: { apiKey: 'mock_medium_key' }
      })
      assert.strictEqual(resMedium.status, 'published_live')
    } finally {
      global.fetch = originalFetch
    }
  })
})
