import assert from 'node:assert/strict'
import test from 'node:test'
import http from 'node:http'
import fs from 'node:fs'
import path from 'node:path'
import {
  createOrPublishPost,
  getPostsQueue,
  pushPendingBrowserDispatch,
  getPendingBrowserDispatches,
  popPendingBrowserDispatch
} from '../server/social-publisher.mjs'
import { buildPlatformComposerUrl } from '../extension/modules/background/platform-urls.js'

test('Omni-channel composer URL generator produces exact valid URLs for all platforms', () => {
  const sampleTitle = 'Zuari v2.5 Release: Zero-VDOM Web Engine'
  const sampleContent = 'Shipped new reactive benchmarks. 0ms hydration!'

  const xUrl = buildPlatformComposerUrl('x', sampleTitle, sampleContent)
  assert.ok(xUrl.startsWith('https://x.com/intent/post?text='))
  assert.ok(xUrl.includes(encodeURIComponent('Shipped new reactive benchmarks')))

  const redditUrl = buildPlatformComposerUrl('reddit', sampleTitle, sampleContent, 'r/programming')
  assert.equal(
    redditUrl,
    `https://www.reddit.com/r/programming/submit?selftext=true&title=${encodeURIComponent(sampleTitle)}&text=${encodeURIComponent(sampleContent)}`
  )

  const linkedinUrl = buildPlatformComposerUrl('linkedin', sampleTitle, sampleContent)
  assert.ok(linkedinUrl.startsWith('https://www.linkedin.com/feed/?shareActive=true&text='))

  assert.equal(buildPlatformComposerUrl('devto'), 'https://dev.to/new')
  assert.equal(buildPlatformComposerUrl('github'), 'https://gist.github.com/')
  assert.equal(buildPlatformComposerUrl('hashnode'), 'https://hashnode.com/create/story')
  assert.equal(buildPlatformComposerUrl('discord'), 'https://discord.com/app')
})

test('Pending browser dispatches bridge: push, inspect, and pop queue', async () => {
  const testId = `test_dispatch_${Date.now()}`
  pushPendingBrowserDispatch({
    id: testId,
    platformId: 'x',
    title: 'Test Dispatch Title',
    content: 'Test Dispatch Body'
  })

  const queue = getPendingBrowserDispatches()
  assert.ok(queue.some(item => item.id === testId))

  const popped = popPendingBrowserDispatch(testId)
  assert.equal(popped?.id, testId)
  assert.equal(popped?.platformId, 'x')

  const queueAfter = getPendingBrowserDispatches()
  assert.ok(!queueAfter.some(item => item.id === testId))
})

test('Live server HTTP endpoint brutality test: /api/social/posts, /api/social/harvest, /api/social/pending-dispatches', async t => {
  // Test connection to backend, starting a test server if 4174 is not already running
  let server = null
  let activePort = 4174
  t.after(() => server?.close())

  const isServerRunning = await new Promise(resolve => {
    const testReq = http.get('http://127.0.0.1:4174/api/social/platforms', () => resolve(true))
    testReq.on('error', () => resolve(false))
  })

  if (!isServerRunning) {
    const { routeRequest } = await import('../server/router.mjs')
    server = http.createServer((req, res) => routeRequest(req, res))
    await new Promise(resolve => {
      server.listen(0, '127.0.0.1', () => {
        activePort = server.address().port
        resolve()
      })
    })
  }

  const checkEndpoint = async (path, options = {}) => {
    return new Promise((resolve, reject) => {
      const req = http.request(
        {
          hostname: '127.0.0.1',
          port: activePort,
          path,
          method: options.method || 'GET',
          headers: options.headers || {}
        },
        res => {
          let data = ''
          res.on('data', chunk => { data += chunk })
          res.on('end', () => {
            try {
              resolve({ status: res.statusCode, data: JSON.parse(data) })
            } catch {
              resolve({ status: res.statusCode, raw: data })
            }
          })
        }
      )
      req.on('error', reject)
      if (options.body) req.write(options.body)
      req.end()
    })
  }

  // 1. GET /api/social/posts
  const postsRes = await checkEndpoint('/api/social/posts')
  assert.equal(postsRes.status, 200)
  assert.ok(Array.isArray(postsRes.data?.posts))

  // 2. POST /api/social/harvest
  const harvestPayload = JSON.stringify({
    platformId: 'reddit',
    title: 'Benchmarking Reactive Frameworks 2026',
    authorHandle: 'u/frontend_lead',
    summary: 'Great discussion on sub-millisecond virtual DOM alternatives.',
    url: 'https://reddit.com/r/webdev/comments/test123'
  })

  const harvestRes = await checkEndpoint('/api/social/harvest', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: harvestPayload
  })
  assert.equal(harvestRes.status, 201)
  assert.equal(harvestRes.data?.success, true)
  assert.equal(harvestRes.data?.harvested?.platformId, 'reddit')

  // 3. GET & POST /api/social/pending-dispatches
  const dispatchRes = await checkEndpoint('/api/social/pending-dispatches')
  assert.equal(dispatchRes.status, 200)
  assert.equal(dispatchRes.data?.success, true)
  assert.ok(Array.isArray(dispatchRes.data?.items))

})
