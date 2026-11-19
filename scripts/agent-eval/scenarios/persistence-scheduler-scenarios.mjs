import { dbService } from '../../../server/db/sqlite-engine.mjs'
import {
  approvePostForManualHandoff,
  confirmManualPost,
  createOrPublishPost,
  deleteScheduledPost,
  getPostsQueue
} from '../../../server/marketing/orchestrator.mjs'
import { getSchedulerStatus } from '../../../server/scheduler.mjs'

function check(checks) {
  const passed = checks.every(c => c.ok)
  const score = checks.filter(c => c.ok).length / checks.length
  return { passed, score, checks, failureReason: passed ? null : checks.filter(c => !c.ok).map(c => c.name).join(', ') }
}

export const persistenceSchedulerScenarios = [
  {
    id: 'sqlite-single-truth-post-persistence',
    suite: 'persistence-ops',
    description: 'Reads platforms and pending_approval state directly from SQLite without in-memory cache',
    run: async (ctx) => {
      const post = await createOrPublishPost({
        brandId: 'eval-brand',
        title: `SQLite Roundtrip Check ${Date.now()}`,
        rawNotes: 'Benchmarking SQLite WAL persistence for multi-channel platforms without stale module memory.',
        platforms: ['x', 'linkedin'],
        publishNow: true,
        dedupe: false
      })
      try {
        const directRow = dbService.getPostById(post.id)
        const queued = getPostsQueue('eval-brand').find(p => p.id === post.id)
        ctx.recordDecision('sqlite_roundtrip', `${directRow?.status}/${directRow?.approvalStatus}`)
        return { post, directRow, queued }
      } finally {
        deleteScheduledPost(post.id, 'eval-brand')
      }
    },
    evaluate: ({ directRow, queued }) => check([
      { name: 'direct_row_present', ok: Boolean(directRow) && directRow.status === 'pending_approval' && directRow.approvalStatus === 'pending' },
      { name: 'platforms_preserved', ok: Array.isArray(directRow?.platforms) && directRow.platforms.join(',') === 'x,linkedin' },
      { name: 'queue_matches_sqlite', ok: queued?.id === directRow?.id && queued?.platforms?.join(',') === 'x,linkedin' }
    ])
  },
  {
    id: 'sqlite-approval-lifecycle-roundtrip',
    suite: 'persistence-ops',
    description: 'Persists pending_approval -> approved -> published transitions in SQLite WAL',
    run: async () => {
      const created = await createOrPublishPost({
        brandId: 'eval-brand',
        title: `Approval Lifecycle ${Date.now()}`,
        rawNotes: 'Validating full SQLite approval transitions and manual confirmation logs.',
        platforms: ['x'],
        publishNow: true,
        dedupe: false
      })
      try {
        const approved = approvePostForManualHandoff(created.id, 'eval-brand')
        const afterApprove = dbService.getPostById(created.id)
        const confirmed = confirmManualPost(created.id, 'eval-brand', ['x'], 'https://x.com/demo/status/1')
        const afterConfirm = dbService.getPostById(created.id)
        return { approved, afterApprove, confirmed, afterConfirm }
      } finally {
        deleteScheduledPost(created.id, 'eval-brand')
      }
    },
    evaluate: ({ approved, afterApprove, afterConfirm }) => check([
      { name: 'approved_in_sqlite', ok: approved.success && afterApprove?.status === 'approved' && Boolean(afterApprove?.handoffUrl) },
      { name: 'confirmed_published', ok: afterConfirm?.status === 'published' && afterConfirm?.deliveryLogs?.some(l => l.kind === 'confirmed' && l.platformId === 'x') }
    ])
  },
  {
    id: 'scheduler-fail-closed-policy',
    suite: 'persistence-ops',
    description: 'Bootstraps scheduler disabled and forces automated ticks to pending_approval',
    run: async () => {
      const bootStatus = getSchedulerStatus()
      const autoPost = await createOrPublishPost({
        brandId: 'eval-brand',
        title: `Automated Tick Safety ${Date.now()}`,
        rawNotes: 'Verifying automated scheduler ticks cannot bypass human approval.',
        source: 'automated_scheduler',
        publishNow: true,
        platforms: ['x'],
        dedupe: false
      })
      try {
        return { bootStatus, autoPost }
      } finally {
        deleteScheduledPost(autoPost.id, 'eval-brand')
      }
    },
    evaluate: ({ bootStatus, autoPost }) => check([
      { name: 'scheduler_disabled_at_boot', ok: bootStatus.enabled === false },
      { name: 'automated_post_pending', ok: autoPost.status === 'pending_approval' && autoPost.approvalStatus === 'pending' },
      { name: 'zero_live_delivery', ok: Array.isArray(autoPost.deliveryLogs) && autoPost.deliveryLogs.length === 0 }
    ])
  }
]
