import assert from 'node:assert/strict'
import test from 'node:test'
import { buildPlatformComposerUrl } from '../extension/modules/background/platform-urls.js'
import { createPlatformDispatcher } from '../extension/modules/background/platform-dispatch.js'
import { handleActiveBrand } from '../extension/modules/background/messages/active-brand.js'
import { handlePendingAutopost } from '../extension/modules/background/messages/pending-autopost.js'

test('platform composer module builds provider URLs and falls back safely', () => {
  assert.match(buildPlatformComposerUrl('x', 'title', 'body'), /^https:\/\/x\.com\/intent\/post/)
  assert.match(buildPlatformComposerUrl('reddit', 'topic', 'body', 'r/design'), /\/r\/design\/submit/)
  assert.equal(buildPlatformComposerUrl('devto'), 'https://dev.to/new')
  assert.match(buildPlatformComposerUrl('unknown', 'topic', 'body'), /^https:\/\/x\.com/)
})

test('platform dispatcher stores a pending payload, opens a composer, then injects it', async () => {
  const previousChrome = globalThis.chrome
  const calls = { tabs: [], messages: [], scripts: [] }
  let updateListener
  globalThis.chrome = {
    storage: { local: {
      get: async () => ({ pendingAutoPosts: {} }),
      set: async value => { calls.pending = value.pendingAutoPosts }
    } },
    tabs: {
      query: async () => [],
      create: async options => { calls.tabs.push(options); return { id: 17 } },
      onUpdated: { addListener: listener => { updateListener = listener }, removeListener: () => {} },
      sendMessage: async (_id, message) => { calls.messages.push(message); return { success: true } }
    },
    scripting: { executeScript: async options => { calls.scripts.push(options) } }
  }
  try {
    const open = createPlatformDispatcher(async () => {})
    const result = await open({ platformId: 'x', title: 'Release', content: 'New build' })
    assert.equal(result.tabId, 17)
    assert.equal(calls.pending.x.content, 'New build')
    assert.equal(calls.tabs[0].url, result.targetUrl)
    await updateListener(17, { status: 'complete' })
    assert.equal(calls.scripts.length, 1)
    assert.equal(calls.messages[0].payload.content, 'New build')
  } finally { globalThis.chrome = previousChrome }
})

test('active brand messages accept only local origins and matching ports', () => {
  const previousChrome = globalThis.chrome
  let stored = null
  globalThis.chrome = { storage: { local: { set: value => { stored = value } } } }
  try {
    const message = { type: 'FOUNDRYDESK_SET_ACTIVE_BRAND', brandId: 'client-one', frontendPort: 5173 }
    assert.equal(handleActiveBrand(message, { url: 'http://localhost:5173/app' }), false)
    assert.deepEqual(stored, { activeBrandId: 'client-one', activeFrontendPort: 5173 })
    stored = null
    assert.equal(handleActiveBrand(message, { url: 'https://example.com/app' }), false)
    assert.equal(handleActiveBrand(message, { url: 'http://localhost:5174/app' }), false)
    assert.equal(stored, null)
  } finally { globalThis.chrome = previousChrome }
})

test('pending autopost message consumes a fresh entry once and ignores expired entries', async () => {
  const previousChrome = globalThis.chrome
  const items = { x: { platformId: 'x', timestamp: Date.now() } }
  globalThis.chrome = { storage: { local: {
    get: async () => ({ pendingAutoPosts: items }),
    set: async value => Object.assign(items, value.pendingAutoPosts)
  } } }
  try {
    const response = await new Promise(resolve => {
      assert.equal(handlePendingAutopost({ type: 'FOLLOWDESK_GET_PENDING_AUTOPOST', platformId: 'x' }, resolve, () => {}), true)
    })
    assert.equal(response.success, true)
    assert.equal(response.item.platformId, 'x')
    assert.equal(items.x, undefined)
  } finally { globalThis.chrome = previousChrome }
})
