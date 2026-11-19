import { describe, it } from 'node:test'
import assert from 'node:assert'
import {
  SUPPORTED_PLATFORMS,
  getPlatformsStatus,
  generateMultiPlatformContent,
  createOrPublishPost,
  triggerKeepAlivePulse,
  getAiFeedLlmText,
  getAiFeedCatalogJson,
  getTrackedProjects,
  addTrackedProject
} from './marketing/orchestrator.mjs'

describe('marketing publishing workflows', () => {
  it('supports human and AI market platforms', () => {
    const platforms = getPlatformsStatus()
    assert.ok(platforms.length >= 10)
    const aiPlatform = platforms.find(platform => platform.id === 'ai_registry')
    assert.ok(aiPlatform)
    assert.strictEqual(aiPlatform.targetAudience, 'AI Models, Autonomous Agents & Crawlers')
    for (const id of ['github', 'discord', 'devto', 'hashnode', 'x', 'reddit', 'linkedin']) {
      assert.ok(platforms.find(platform => platform.id === id), `Missing expected platform: ${id}`)
    }
    assert.ok(SUPPORTED_PLATFORMS.length >= 10)
  })

  it('generates tailored content variants for every platform', () => {
    const generated = generateMultiPlatformContent({
      topic: 'Building a High-Speed Framework',
      rawNotes: 'Eliminating all latency, zero dependencies, client-side first.',
      tone: 'Engineering Deep Dive',
      frameworkName: 'FollowDesk Engine'
    })
    assert.ok(generated.variants.github.includes('FollowDesk Engine'))
    assert.ok(generated.variants.discord.includes('Devlog Update'))
    assert.ok(generated.variants.devto.includes('---'))
    assert.ok(generated.variants.ai_registry.includes('Autonomous Agents'))
    assert.ok(generated.variants.reddit.includes('r/webdev'))
  })

  it('generates llms.txt and MCP discovery catalog', () => {
    assert.ok(getAiFeedLlmText().includes('AI Agent Index & Capability Directory'))
    assert.ok(getAiFeedLlmText().includes('FollowDesk'))
    const catalog = getAiFeedCatalogJson()
    assert.strictEqual(catalog.targetMarket, 'AI_AND_HUMANS')
    assert.ok(catalog.tools.length >= 1)
  })

  it('tracks projects and frameworks for awareness marketing', () => {
    const initial = getTrackedProjects()
    const added = addTrackedProject({
      name: 'SuperAgent Framework',
      category: 'Agent Orchestration',
      description: 'Zero-latency multi-agent runtime.'
    })
    assert.strictEqual(added.name, 'SuperAgent Framework')
    assert.strictEqual(getTrackedProjects().length, initial.length)
  })

  it('holds user publish requests for approval before delivery', async () => {
    const post = await createOrPublishPost({
      title: `Approval test ${Date.now()}-${Math.random()}`,
      publishNow: true,
      platforms: ['ai_registry', 'discord']
    })
    assert.deepStrictEqual([post.status, post.approvalStatus, post.deliveryLogs.length], ['pending_approval', 'pending', 0])
  })

  it('holds automated publish requests for human approval', async () => {
    const post = await createOrPublishPost({
      title: `Automated approval check ${Date.now()}-${Math.random()}`,
      publishNow: true,
      source: 'automated_scheduler',
      platforms: ['ai_registry']
    })
    assert.strictEqual(post.status, 'pending_approval')
    assert.strictEqual(post.approvalStatus, 'pending')
    assert.strictEqual(post.deliveryLogs.length, 0)
  })

  it('runs account keep-alive heartbeat pulse and streaks', async () => {
    const pulse = await triggerKeepAlivePulse('github')
    assert.strictEqual(pulse.pulsedCount, 1)
    assert.ok(pulse.results[0].streakDays >= 1)
  })

  it('generates visual cards, hashtags, and web links across variants', () => {
    const generated = generateMultiPlatformContent({
      topic: 'Vector Database & Memory Indexing',
      rawNotes: 'Benchmarking embedded SQLite with 10k items per second.',
      webLink: 'https://github.com/developer/followdesk',
      hashtags: ['#BuildInPublic', '#SQLite', '#OpenSource']
    })
    assert.ok(generated.media.imageUrl.startsWith('data:image/svg+xml;utf8,'))
    assert.strictEqual(generated.media.webLink, 'https://github.com/developer/followdesk')
    assert.ok(generated.media.hashtags.length >= 3)
    assert.ok(generated.variants.x.includes('#BuildInPublic') || generated.variants.x.includes('#systemdesign') ||
      generated.variants.x.includes('#softwarearchitecture'))
    assert.ok(generated.variants.linkedin.includes('https://github.com/developer/followdesk'))
  })
})
