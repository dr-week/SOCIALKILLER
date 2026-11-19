import { createHash } from 'node:crypto'
import { fetchLiveTrendingNews } from '../marketing/news-harvester.mjs'
import { transformNewsToViralPost } from '../marketing/news-remodeller.mjs'
import { generateRandomVariation } from '../marketing/post-dictionary.mjs'
import { createOrPublishPost } from '../marketing/orchestrator.mjs'
import { dbService } from '../db/sqlite-engine.mjs'
import { SCHEDULER_CONFIG, persistSchedulerState } from './scheduler-state.mjs'

let inFlightTick = false
export const isTickRunning = () => inFlightTick

function buildTopicPayload(topic, repo, platforms) {
  const cleanRepo = `https://${repo.replace(/^https?:\/\//, '')}`
  const hash = createHash('sha256').update(`${topic.id}|${topic.title}`).digest('hex')
  return {
    idempotencyToken: `sched-topic-${hash.slice(0, 16)}-${new Date().toISOString().slice(0, 10)}`,
    source: 'automated_scheduler_user_topic',
    topicId: topic.id,
    title: topic.hook || topic.title,
    topic: topic.title,
    rawNotes: `${topic.debate}\n${topic.question}\nGitHub: ${topic.githubSolution || cleanRepo}`,
    platforms,
    publishNow: false,
    dedupe: true,
    variants: {
      x: `${topic.hook || topic.title}\n\n${topic.debate}\n\n${topic.question}\n\n📌 Bookmark this. Repo link in replies 👇`,
      x_reply: `🔗 Open-source project built around this philosophy:\n${cleanRepo}\n\nStar the repo on GitHub! ⭐`,
      reddit: `[Discussion] ${topic.hook || topic.title}\n\nHey devs,\n\n${topic.debate}\n\n${topic.question}\n\n(We've been building around this in our open-source repo: ${cleanRepo})`,
      linkedin: `${topic.hook || topic.title}\n\n${topic.debate}\n\nKey Takeaway:\n${topic.githubSolution || cleanRepo}\n\n${topic.question}\n\n👉 Open-source repo: ${cleanRepo}`,
      github: `# ${topic.title}\n\n${topic.hook || ''}\n\n${topic.debate || ''}\n\nProject: ${cleanRepo}`,
      devto: `---\ntitle: "${topic.title}"\npublished: true\ntags: webdev, performance, opensource\n---\n\n${topic.debate}\n\n${topic.question}\n\nRepository: ${cleanRepo}`
    }
  }
}

export async function executeAutomatedSchedulerTick(options = {}) {
  if (inFlightTick) return { skipped: true, reason: 'Tick already in progress' }
  inFlightTick = true

  const repo = options.githubRepo || SCHEDULER_CONFIG.githubRepo
  const platforms = options.targetPlatforms || SCHEDULER_CONFIG.targetPlatforms
  const pendingTopics = dbService.getPendingUserTopics()
  const mode = pendingTopics?.length ? 'pending_user_topic' : (Math.random() > 0.4 ? 'news_remodel' : 'dictionary_variation')
  let generatedPost = null

  try {
    if (mode === 'pending_user_topic') {
      // Fail-closed: automated ticks never pass publishNow:true; posts stage for human review.
      generatedPost = await createOrPublishPost(buildTopicPayload(pendingTopics[0], repo, platforms))
    } else if (mode === 'news_remodel') {
      try {
        const news = await fetchLiveTrendingNews()
        const topLead = news.leads?.length ? news.leads[Math.floor(Math.random() * Math.min(5, news.leads.length))] : null
        if (topLead) {
          const transformed = transformNewsToViralPost({
            rawTitle: topLead.title, rawSummary: topLead.summary, sourceUrl: topLead.url,
            githubRepo: repo, angle: Math.random() > 0.5 ? 'future_of_coding' : 'contrarian'
          })
          const hash = createHash('sha256').update(`${topLead.title}|${transformed.suggestedPostPayload.title}`).digest('hex')
          generatedPost = await createOrPublishPost({
            idempotencyToken: `sched-news-${hash.slice(0, 16)}-${new Date().toISOString().slice(0, 10)}`,
            source: 'automated_scheduler',
            title: transformed.suggestedPostPayload.title,
            topic: transformed.original.title,
            rawNotes: transformed.suggestedPostPayload.rawNotes,
            platforms,
            publishNow: false,
            dedupe: true,
            variants: transformed.variants
          })
        }
      } catch (newsErr) {
        console.warn('[Scheduler] News harvesting failed, falling back to dictionary variation:', newsErr.message)
      }
    }

    if (!generatedPost || generatedPost.status === 'skipped_limit') {
      const variation = generateRandomVariation({ githubRepo: repo, platform: 'x' })
      const hash = createHash('sha256').update(`${variation.title}|${variation.mainPost}`).digest('hex')
      generatedPost = await createOrPublishPost({
        idempotencyToken: `sched-dict-${hash.slice(0, 16)}-${new Date().toISOString().slice(0, 10)}`,
        source: 'automated_scheduler',
        title: variation.title,
        topic: 'Future of Coding & Zero-VDOM Architecture',
        rawNotes: `Hook: ${variation.components.hook}\nConflict: ${variation.components.conflict}\nInsight: ${variation.components.insight}\nDebate: ${variation.components.debate}`,
        platforms,
        publishNow: false,
        dedupe: true,
        variants: {
          x: variation.mainPost,
          x_reply: variation.replyWithGithub,
          reddit: generateRandomVariation({ githubRepo: repo, platform: 'reddit' }).mainPost,
          linkedin: generateRandomVariation({ githubRepo: repo, platform: 'linkedin' }).mainPost,
          github: `# ${variation.title}\n\n${variation.mainPost}\n\n${variation.replyWithGithub}`,
          devto: `---\ntitle: "${variation.title}"\npublished: true\ntags: webdev, performance, opensource\n---\n\n${variation.mainPost}\n\n${variation.replyWithGithub}`
        }
      })
    }

    SCHEDULER_CONFIG.lastRunAt = new Date().toISOString()
    SCHEDULER_CONFIG.totalDispatched++
    SCHEDULER_CONFIG.consecutiveFailures = 0
    SCHEDULER_CONFIG.nextRunAt = new Date(Date.now() + SCHEDULER_CONFIG.intervalMs).toISOString()
    persistSchedulerState()

    return {
      success: true, mode, postId: generatedPost?.id, title: generatedPost?.title,
      scheduledAt: SCHEDULER_CONFIG.lastRunAt, nextScheduled: SCHEDULER_CONFIG.nextRunAt
    }
  } catch (err) {
    SCHEDULER_CONFIG.consecutiveFailures = (SCHEDULER_CONFIG.consecutiveFailures || 0) + 1
    const backoffMs = Math.min(1000 * 60 * 30, Math.pow(2, SCHEDULER_CONFIG.consecutiveFailures) * 30000)
    SCHEDULER_CONFIG.nextRunAt = new Date(Date.now() + backoffMs).toISOString()
    persistSchedulerState()
    return { success: false, error: err.message, nextRetry: SCHEDULER_CONFIG.nextRunAt }
  } finally {
    inFlightTick = false
  }
}
