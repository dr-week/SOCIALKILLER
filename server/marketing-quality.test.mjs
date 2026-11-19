import { describe, it } from 'node:test'
import assert from 'node:assert'

describe('marketing content quality', () => {
  it('rejects short and spam posts while allowing substantive engineering content', async () => {
    const { validatePostQuality } = await import('./marketing/content-safety-guard.mjs')
    const short = validatePostQuality({ title: 'Hi', body: 'Test' })
    assert.strictEqual(short.passed, false)
    assert.ok(short.reason.includes('too short'))
    const spam = validatePostQuality({
      title: 'Get rich quick crypto moon giveaway for developers',
      body: 'Guaranteed 100x free money comment yes to get link smash that like button!'
    })
    assert.strictEqual(spam.passed, false)
    assert.ok(spam.reason.includes('banned spam'))
    assert.strictEqual(validatePostQuality({
      title: 'Zero-Copy Shared Memory Between Wasm and Signals',
      body: 'Benchmarking Float64Array memory buffers across Web Workers and DOM signal graphs eliminating garbage collection pauses on 120Hz displays.',
      topic: 'Wasm Benchmarks'
    }).passed, true)
  })

  it('updates the dynamic dictionary from community signals', async () => {
    const { ingestCommunitySignalsToDictionary, generateRandomVariation, getActiveDictionaryElements } =
      await import('./marketing/post-dictionary.mjs')
    const signal = {
      id: `reddit-sig-${Date.now()}`,
      channel: 'reddit',
      title: 'How we reduced bundle size by 90% without breaking SSR',
      summary: 'Detailed benchmark breakdown on tree-shaking and dynamic imports'
    }
    assert.strictEqual(ingestCommunitySignalsToDictionary([signal]).ingestedCount, 1)
    assert.ok(getActiveDictionaryElements('hooks').includes(signal.title))
    const post = generateRandomVariation({
      githubRepo: 'github.com/dr-week/fast-framework',
      platform: 'reddit',
      targetSubreddit: 'r/webdev'
    })
    assert.ok(post.title.length > 20)
    assert.ok(post.mainPost.includes('Hey r/webdev!'))
    assert.ok(post.mainPost.includes('### The Engineering Trade-Offs'))
    assert.ok(post.mainPost.includes('github.com/dr-week/fast-framework'))
  })
})
