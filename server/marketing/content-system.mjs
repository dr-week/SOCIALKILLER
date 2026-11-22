/**
 * Viral Content System Archetypes & Strategy Taxonomy (<150 lines)
 */

import { dbService } from '../db/sqlite-engine.mjs'
import { getPostMediaAndLinks } from './media-card.mjs'
import { CONTENT_PILLARS, VIRAL_TOPIC_REGISTRY } from './content/viral-topic-registry.mjs'

export { CONTENT_PILLARS, VIRAL_TOPIC_REGISTRY }

const recentlyUsedTopicMemory = new Set()

export function getRandomPillarTopic(pillar = null, options = {}) {
  const { preferPending = true } = options

  if (preferPending && !pillar) {
    try {
      const pendingUserTopics = dbService.getPendingUserTopics()
      if (pendingUserTopics && pendingUserTopics.length > 0) {
        const candidate =
          pendingUserTopics.find(t => !recentlyUsedTopicMemory.has(t.id)) || pendingUserTopics[0]
        recentlyUsedTopicMemory.add(candidate.id)
        if (recentlyUsedTopicMemory.size > 25) {
          const first = recentlyUsedTopicMemory.values().next().value
          recentlyUsedTopicMemory.delete(first)
        }
        return { ...candidate, isUserTopic: true }
      }
    } catch {}
  }

  const filtered = pillar
    ? VIRAL_TOPIC_REGISTRY.filter(t => t.pillar === pillar)
    : VIRAL_TOPIC_REGISTRY
  const list = filtered.length > 0 ? filtered : VIRAL_TOPIC_REGISTRY

  const historicalPosts = dbService.getAllPosts()
  const recentHistoricalTopics = new Set(
    historicalPosts.slice(0, 30).map(p => (p.topic || p.title || '').toLowerCase())
  )

  const freshPool = list.filter(t => {
    if (recentlyUsedTopicMemory.has(t.id)) return false
    const lowerHook = (t.hook || '').toLowerCase()
    for (const recent of recentHistoricalTopics) {
      if (recent && (recent.includes(lowerHook) || lowerHook.includes(recent))) return false
    }
    return true
  })
  const pool = freshPool.length > 0 ? freshPool : list

  if (freshPool.length === 0) recentlyUsedTopicMemory.clear()

  const selected = pool[Math.floor(Math.random() * pool.length)]
  recentlyUsedTopicMemory.add(selected.id)
  return selected
}

export function formatSystemPost({
  topicObj = VIRAL_TOPIC_REGISTRY[0],
  githubRepo = 'github.com/dr-week/fast-framework',
  platform = 'x',
  tags = []
} = {}) {
  const { hook, debate, question, githubSolution, callToAction } = topicObj
  const cleanRepo = `https://${githubRepo.replace(/^https?:\/\//, '')}`
  const media = getPostMediaAndLinks({ topic: hook, tags, webLink: cleanRepo })
  const hashStr = media.hashtagString

  if (platform === 'x') {
    return {
      title: hook,
      mainPost: `${hook}\n\n${debate}\n\n${question}\n\n📌 ${callToAction}\n\n${hashStr.slice(0, 50)}`,
      replyWithGithub: `🔗 Live Repository & Benchmarks:\n${cleanRepo}\n\nStar the repo to support zero-bloat architecture! ⭐`,
      media
    }
  }

  if (platform === 'reddit') {
    return {
      title: `[Discussion] ${hook}`,
      mainPost: `Hey devs,\n\n${debate}\n\n${question}\n\nLive repository: ${cleanRepo}\n\nCurious how your team handles this in practice.`,
      media
    }
  }

  if (platform === 'linkedin') {
    return {
      title: hook,
      mainPost: `${hook}\n\n${debate}\n\nKey Engineering Takeaway:\n${githubSolution}\n\n${question}\n\n🔗 Live Reference: ${cleanRepo}\n\n${hashStr}`,
      media
    }
  }

  return {
    title: hook,
    mainPost: `${hook}\n\n${debate}\n\n${question}\n\n👉 Open-source repo: ${cleanRepo}\n\n${hashStr}`,
    media
  }
}
