import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { createLinkedInTextPost } from './integrations/linkedin/posts-api.mjs'

describe('LinkedIn Posts API integration', () => {
  it('uses the current versioned REST endpoint and returns the confirmed post id', async () => {
    const originalFetch = global.fetch
    global.fetch = async (url, options) => {
      assert.equal(url, 'https://api.linkedin.com/rest/posts')
      assert.equal(options.method, 'POST')
      assert.equal(options.headers.Authorization, 'Bearer token')
      assert.equal(options.headers['LinkedIn-Version'], '202610')
      assert.equal(options.headers['X-Restli-Protocol-Version'], '2.0.0')
      assert.deepEqual(JSON.parse(options.body), {
        author: 'urn:li:person:123',
        commentary: 'A launch update',
        visibility: 'PUBLIC',
        distribution: { feedDistribution: 'MAIN_FEED', targetEntities: [], thirdPartyDistributionChannels: [] },
        lifecycleState: 'PUBLISHED',
        isReshareDisabledByAuthor: false
      })
      return new Response('', { status: 201, headers: { 'x-restli-id': 'urn:li:share:456' } })
    }

    try {
      const result = await createLinkedInTextPost({ token: 'token', authorUrn: 'urn:li:person:123', content: 'A launch update' })
      assert.deepEqual(result, { id: 'urn:li:share:456', status: 201 })
    } finally {
      global.fetch = originalFetch
    }
  })

  it('surfaces platform rejection details instead of treating them as a publish success', async () => {
    const originalFetch = global.fetch
    global.fetch = async () => new Response(JSON.stringify({ message: 'Missing w_member_social permission.' }), { status: 403 })

    try {
      await assert.rejects(
        createLinkedInTextPost({ token: 'token', authorUrn: 'urn:li:person:123', content: 'Draft' }),
        /LinkedIn API returned 403: Missing w_member_social permission\./
      )
    } finally {
      global.fetch = originalFetch
    }
  })

  it('validates the author before making a remote request', async () => {
    const originalFetch = global.fetch
    global.fetch = async () => { throw new Error('A request should not be sent') }
    try {
      await assert.rejects(createLinkedInTextPost({ token: 'token', authorUrn: '', content: 'Draft' }), /author URN is required/)
    } finally {
      global.fetch = originalFetch
    }
  })
})
