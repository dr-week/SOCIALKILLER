import assert from 'node:assert/strict'
import test from 'node:test'
import { createOrPublishPost } from './marketing/orchestrator.mjs'

test('rejects browser dispatch requests before creating or dispatching a post', async () => {
  const result = await createOrPublishPost({
    title: `Browser dispatch guard ${Date.now()}`,
    platforms: ['x'],
    queueBrowser: true,
    autoClickSubmit: true
  })

  assert.deepEqual([result.id, result.status], [null, 'rejected_approval_required'])
})
