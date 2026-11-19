import { describe, it } from 'node:test'
import assert from 'node:assert'
import { pickHashtags, dedupeHashtagsInText } from './marketing/hashtag-picker.mjs'
import { createShortPost } from './marketing/short-post.mjs'
import { findPostMedia } from './marketing/post-media.mjs'

describe('Random post hashtags and media', () => {
  it('never emits generic or repeated hashtags', () => {
    const tags = pickHashtags({ title: 'Rust and WebAssembly make the browser faster', max: 2 })
    assert.deepStrictEqual(tags, ['rustlang', 'WebAssembly'])
    assert.deepStrictEqual(pickHashtags({ title: 'Nothing technical here' }), [])
    const cleaned = dedupeHashtagsInText('Hello #Tech #BuildInPublic #AI #ai\n#AI')
    assert.strictEqual(cleaned, 'Hello #AI')
  })

  it('creates posts without #BuildInPublic and omits links for idea posts', () => {
    const idea = createShortPost({ topic: 'What if every CLI had a --explain flag?', evergreen: true, random: () => 0 })
    assert.ok(!/buildinpublic/i.test(idea.text))
    assert.ok(!idea.text.includes('http'))
    assert.match(idea.text, /^Brainstorm:/)
    const live = createShortPost({ lead: { title: 'Rust 2.0 lands with faster compile times', url: 'https://example.com/rust', sourceId: 'hn' }, random: () => 0 })
    assert.ok(!/buildinpublic|#tech\b/i.test(live.text))
    assert.ok(live.text.includes('#rustlang'))
  })

  it('does not fetch or generate automatic draft media', async () => {
    const originalFetch = globalThis.fetch
    let networkRequests = 0
    globalThis.fetch = async () => {
      networkRequests += 1
      throw new Error('Random draft media must not make network requests.')
    }

    try {
      assert.strictEqual(await findPostMedia({ lead: { url: 'https://example.com/article' }, title: 'test idea' }), null)
      assert.strictEqual(networkRequests, 0)
    } finally {
      globalThis.fetch = originalFetch
    }
  })
})
