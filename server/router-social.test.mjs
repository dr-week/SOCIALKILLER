import assert from 'node:assert/strict'
import test from 'node:test'
import { routeRequest } from './router.mjs'
import { simulateRequest } from './router-test-utils.mjs'

test('social routes handle platform generation, publishing, and keep-alive', async () => {
  const uniqueTopic = `Automated Multi-Platform Release ${Date.now()}`
  const platforms = await simulateRequest(routeRequest, 'GET', '/api/social/platforms')
  assert.equal(platforms.status, 200)
  assert.equal(platforms.body.platforms.length, 10)

  const generated = await simulateRequest(routeRequest, 'POST', '/api/social/generate', {
    topic: uniqueTopic,
    rawNotes: `Supports X, Reddit, GitHub, Discord, LinkedIn, Dev.to, Hashnode, Medium, and Instagram. ${uniqueTopic}`,
    includeCodeSnippet: true
  })
  assert.equal(generated.status, 200)
  assert.ok(generated.body.variants.x.includes(uniqueTopic))
  assert.ok(generated.body.variants.devto.includes('title:'))
  assert.ok(generated.body.variants.github.includes('export async function publishEverywhere'))

  const post = await simulateRequest(routeRequest, 'POST', '/api/social/posts', {
    title: uniqueTopic, platforms: ['x', 'github', 'discord', 'devto', 'linkedin', 'reddit'],
    variants: generated.body.variants, publishNow: true, enforceLimits: false
  })
  assert.equal(post.status, 201)
  assert.deepEqual([post.body.post.status, post.body.post.approvalStatus, post.body.post.deliveryLogs.length], ['pending_approval', 'pending', 0])

  const keepAlive = await simulateRequest(routeRequest, 'POST', '/api/social/keep-alive', { platformId: 'github' })
  assert.equal(keepAlive.status, 200)
  assert.equal(keepAlive.body.pulsedCount, 1)

  const copy = await simulateRequest(routeRequest, 'POST', '/api/marketing/lyra', {
    productName: 'Zuari (dr-week/fast-framework)', framework: 'PAS'
  })
  assert.equal(copy.status, 200)
  assert.ok(copy.body.selectedCopy.includes('Zuari'))
  assert.ok(copy.body.meetingPromoKit.xInvite.includes('LIVE DEMO'))
  assert.ok(Array.isArray(copy.body.adCampaigns))

  const intelligence = await simulateRequest(routeRequest, 'GET', '/api/marketing/intel')
  assert.equal(intelligence.body.segments.length, 2)
  assert.ok(intelligence.body.competitorMatrix.some(item => item.framework.includes('Zuari')))
  const llms = await simulateRequest(routeRequest, 'GET', '/api/marketing/llms.txt')
  assert.ok(String(llms.body).includes('dr-week/fast-framework'))

  const viral = await simulateRequest(routeRequest, 'GET', '/api/social/viral-randomize?seed=1&repo=github.com/dr-week/fast-framework')
  assert.equal(viral.status, 200)
  assert.ok(viral.body.hook && viral.body.variants.x && viral.body.variants.reddit)

  const topic = await simulateRequest(routeRequest, 'POST', '/api/social/custom-topics', {
    title: 'Future of Local-First Web Engines', hook: 'Why cloud databases are becoming a liability in 2026',
    debate: 'Local SQLite and WASM allow instant operations without monthly cloud invoices.',
    question: 'Are you moving more compute back to client devices?'
  })
  assert.equal(topic.status, 201)
  const list = await simulateRequest(routeRequest, 'GET', '/api/social/custom-topics')
  assert.ok(list.body.topics.length >= 1 && list.body.pendingCount >= 1)
  const surfaced = await simulateRequest(routeRequest, 'GET', '/api/social/viral-randomize')
  assert.ok(surfaced.body.topic)
  const removed = await simulateRequest(routeRequest, 'DELETE', `/api/social/custom-topics?id=${topic.body.topic.id}`)
  assert.equal(removed.status, 200)
})
