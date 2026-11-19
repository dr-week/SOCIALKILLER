import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { executePlatformDelivery } from '../server/marketing/dispatcher.mjs'

describe('LinkedIn publish adapter', () => {
  it('records direct publishing only after the Posts API confirms the post', async () => {
    const originalFetch = global.fetch
    global.fetch = async (url, options) => {
      assert.equal(url, 'https://api.linkedin.com/rest/posts')
      assert.equal(options.headers.Authorization, 'Bearer access-token')
      assert.equal(options.headers['LinkedIn-Version'], '202610')
      assert.equal(options.headers['X-Restli-Protocol-Version'], '2.0.0')
      assert.equal(JSON.parse(options.body).author, 'urn:li:organization:123')
      return new Response('', { status: 201, headers: { 'x-restli-id': 'urn:li:share:456' } })
    }

    try {
      const result = await executePlatformDelivery('linkedin', 'A product update', 'Update', {
        credentials: { accessToken: 'access-token', authorUrn: 'urn:li:organization:123' }
      })
      assert.equal(result.status, 'published_live')
      assert.equal(result.mode, 'live_api')
      assert.match(result.message, /urn:li:share:456/)
    } finally {
      global.fetch = originalFetch
    }
  })

  it('returns a manual handoff after a permission rejection', async () => {
    const originalFetch = global.fetch
    global.fetch = async () => new Response(JSON.stringify({ message: 'Missing w_member_social permission.' }), { status: 403 })

    try {
      const result = await executePlatformDelivery('linkedin', 'A product update', 'Update', {
        credentials: { accessToken: 'access-token', authorUrn: 'urn:li:person:123' }
      })
      assert.equal(result.status, 'simulated_or_ready')
      assert.equal(result.mode, 'intent_assisted')
      assert.match(result.message, /Missing w_member_social permission/)
      assert.ok(result.intentUrl)
    } finally {
      global.fetch = originalFetch
    }
  })
})
