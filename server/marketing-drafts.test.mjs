import { describe, it } from 'node:test'
import assert from 'node:assert'

describe('marketing draft generation and feedback', () => {
  it('keeps X drafts short, sourced, and within the posting dictionary', async () => {
    const { createContentHash, createShortPost, createSourceKey, createTopicKey, isNearDuplicateTopic } =
      await import('./marketing/short-post.mjs')
    const post = createShortPost({
      lead: { title: 'A useful new browser API', url: 'https://example.com/story', sourceId: 'hn' },
      focus: 'developer tools',
      random: () => 0
    })
    assert.ok(post.text.length <= 280)
    assert.ok(post.text.split('\n').length <= 2)
    assert.ok(post.text.includes('https://example.com/story'))
    assert.ok((post.text.match(/#[A-Za-z0-9_]+/g) || []).length <= 2)
    assert.strictEqual(post.context, 'live')
    assert.ok(createShortPost({ topic: 'A distinct evergreen idea about transparent software', evergreen: true, random: () => 0 }).title.startsWith('A distinct evergreen idea'))
    const longPost = createShortPost({
      lead: { title: 'A long report headline about a new platform feature and its surprising impact', url: `https://example.com/${'story-'.repeat(20)}`, sourceId: 'hn' },
      focus: 'developer tools',
      random: () => 0
    })
    assert.ok(longPost.text.length <= 280)
    assert.match(longPost.text.split('\n')[0], /[.!?…]$/)
    assert.strictEqual(createTopicKey('New trend: Fast tools!'), createTopicKey('new trend fast tools'))
    assert.ok(isNearDuplicateTopic('Virtual DOM performance drops in modern apps', 'Modern apps show Virtual DOM performance drops'))
    assert.strictEqual(createSourceKey('https://example.com/story?utm_source=feed'), createSourceKey('https://example.com/story'))
    assert.strictEqual(createContentHash('A post\nwith space'), createContentHash('a post with space'))
    const adapted = createShortPost({
      lead: { title: 'A useful browser improvement', url: 'https://example.com/story', sourceId: 'hn' },
      templateStats: [
        { templateId: 'plot-twist', likes: 0, dislikes: 100 },
        { templateId: 'benchmark', likes: 0, dislikes: 100 },
        { templateId: 'hype-check', likes: 0, dislikes: 100 },
        { templateId: 'useful-test', likes: 100, dislikes: 0 }
      ],
      random: () => 0.5
    })
    assert.strictEqual(adapted.templateId, 'useful-test')
  })

  it('stores one feedback state per draft and rejects repeated company topics', async () => {
    const { db, dbService } = await import('./db/sqlite-engine.mjs')
    db.exec('SAVEPOINT generated_draft_feedback_test')
    try {
      const draft = {
        id: 'test-draft-feedback', brandId: 'test-company', platformId: 'x',
        topicKey: `test-topic-${Date.now()}`, sourceKey: `test-source-${Date.now()}`, contentHash: 'test-content-hash',
        topic: 'Test topic', content: 'Test post', source: 'test', sourceUrl: 'https://example.com/story',
        context: 'live', templateId: 'useful-test'
      }
      assert.ok(dbService.saveGeneratedDraft(draft))
      assert.strictEqual(dbService.saveGeneratedDraft({ ...draft, id: 'duplicate-draft' }), null)
      assert.ok(dbService.hasGeneratedDraft({ brandId: draft.brandId, platformId: 'x', topicKey: draft.topicKey, sourceKey: '', contentHash: '' }))
      assert.strictEqual(dbService.setGeneratedDraftFeedback({ id: draft.id, brandId: 'wrong-company', feedback: 1 }), false)
      assert.strictEqual(dbService.setGeneratedDraftFeedback({ id: draft.id, brandId: draft.brandId, feedback: 1 }), true)
      assert.deepStrictEqual(dbService.getGeneratedDraftFeedbackStats(draft.brandId, 'x'), [{ templateId: 'useful-test', likes: 1, dislikes: 0 }])
      dbService.setGeneratedDraftFeedback({ id: draft.id, brandId: draft.brandId, feedback: -1 })
      assert.deepStrictEqual(dbService.getGeneratedDraftFeedbackStats(draft.brandId, 'x'), [{ templateId: 'useful-test', likes: 0, dislikes: 1 }])
    } finally {
      db.exec('ROLLBACK TO generated_draft_feedback_test; RELEASE generated_draft_feedback_test')
    }
  })
})
