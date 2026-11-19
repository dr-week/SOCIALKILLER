<script setup lang="ts">
import {
  Trash2,
  ExternalLink,
  Calendar,
  CheckCircle2,
  Clock,
  Image,
  Link,
  Hash,
  Send
} from 'lucide-vue-next'
import PlatformIcon from '../common/PlatformIcon.vue'
import { computed, ref } from 'vue'
import type { PlatformId, SocialPostItem } from '../../types'
import PublisherAutopilotTimeline from './PublisherAutopilotTimeline.vue'
import PublisherCampaignCalendar from './PublisherCampaignCalendar.vue'
import PublisherQueueActivityPanel from './PublisherQueueActivityPanel.vue'
import PublisherQueueMetadataWarning from './PublisherQueueMetadataWarning.vue'
import { exportQueueCsv, exportQueueJson } from './queue-export'
import { usePublisherQueueActions } from './usePublisherQueueActions'

const props = defineProps<{
  postsQueue: SocialPostItem[]
  activityLogs: any[]
  platformBadges: Record<PlatformId, { icon: string; color: string; bg: string; label: string }>
}>()
const showAllPosts = ref(false)
const calendarMode = ref(false)
const calendarOffset = ref(0)
const filter = ref('all')
const query = ref('')
const visiblePosts = computed(() => {
  const matching = props.postsQueue.filter(post => (filter.value === 'all' || post.status === filter.value) && (!query.value || post.title.toLowerCase().includes(query.value.toLowerCase()) || post.platforms.some(platform => platform.includes(query.value.toLowerCase()))))
  return showAllPosts.value ? matching : matching.slice(0, 20)
})

const emit = defineEmits<{
  (e: 'removePost', id: string): void
  (e: 'openIntent', id: PlatformId, text?: string): void
  (e: 'refresh'): void
  (e: 'showToast', message: string): void
  (e: 'createPost'): void
}>()
const { busyPostIds, approveForHandoff, duplicatePost } = usePublisherQueueActions({
  findPost: id => props.postsQueue.find(post => post.id === id),
  refresh: () => emit('refresh'),
  showToast: message => emit('showToast', message)
})

async function reviewPost(post: SocialPostItem, reject = false) {
  const text = window.prompt(reject ? 'Optional rejection note:' : 'Edit the post copy:', post.variants?.[post.platforms[0]] || '')
  if (text === null) return
  const response = await fetch('/api/social/posts/review', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ postId: post.id, brandId: post.brandId, reject, variants: reject ? undefined : { [post.platforms[0]]: text } }) })
  if (response.ok) emit('refresh')
}

async function confirmManual(post: SocialPostItem) {
  const platformIds = post.platforms.filter(id => window.confirm(`Confirm this post is live on ${id}?`))
  if (!platformIds.length) return
  const externalUrl = window.prompt('Optional link to the published post:')
  const response = await fetch('/api/social/posts/confirm-manual', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ postId: post.id, brandId: post.brandId, platformIds, externalUrl }) })
  if (response.ok) emit('refresh')
}
</script>

<template>
  <div class="pub-section">
    <PublisherQueueMetadataWarning :posts="postsQueue" />
    <!-- Visual 24-Hour Autopilot Timeline -->
      <PublisherAutopilotTimeline
      :posts="postsQueue"
      :platform-badges="platformBadges"
    />

    <div class="queue-split">
    <!-- Left: Scheduled & Dispatched Posts -->
    <div class="queue-card">
      <div class="card-head">
        <Calendar :size="15" />
        <h4>Campaign queue ({{ postsQueue.length }})</h4>
        <button class="show-all-btn" @click="calendarMode = !calendarMode">{{ calendarMode ? 'List' : 'Calendar' }}</button>
        <button class="show-all-btn" @click="exportQueueJson(postsQueue)">Export JSON</button>
        <button class="show-all-btn" @click="exportQueueCsv(postsQueue)">Export CSV</button>
      </div>

      <div v-if="postsQueue.length === 0" class="empty-state">
        <Send :size="20" aria-hidden="true" />
        <strong>Your queue is empty</strong>
        <span>Create a post to start building your publishing queue.</span>
        <button class="show-all-btn" @click="emit('createPost')">Create a post</button>
      </div>

      <PublisherCampaignCalendar v-if="calendarMode" :posts="postsQueue" :week-offset="calendarOffset" @update:week-offset="calendarOffset = $event" />
      <div v-else class="post-list">
        <input v-model="query" class="queue-search" type="search" aria-label="Search campaigns" placeholder="Search title or channel">
        <select v-model="filter" aria-label="Filter campaigns by status" class="status-filter">
          <option value="all">All statuses</option>
          <option value="pending_approval">Needs review</option>
          <option value="approved">Approved handoff</option>
          <option value="scheduled">Scheduled</option>
          <option value="published">Published</option>
          <option value="failed">Failed</option>
        </select>
        <div v-for="post in visiblePosts" :key="post.id" class="post-item">
          <div class="post-top">
            <div class="post-title-wrap">
              <span class="state-chip" :class="post.status === 'published' ? 'green' : 'amber'">
                <component :is="post.status === 'published' ? CheckCircle2 : Clock" :size="10" />
                {{ post.status }}
              </span>
              <strong>{{ post.title }}</strong>
            </div>
            <button class="del-btn" @click="emit('removePost', post.id)" title="Remove">
              <Trash2 :size="13" />
            </button>
            <button class="show-all-btn" :disabled="Boolean(post.metadataWarning)" :title="post.metadataWarning || 'Duplicate post'" @click="duplicatePost(post)">Duplicate</button>
          </div>
          <PublisherQueueMetadataWarning :post="post" />
          <div v-if="post.status === 'pending_approval'" class="approval-row">
            <span>Review checklist: {{ post.title.trim() ? 'title ✓' : 'add title' }}, {{ (post.variants?.[post.platforms[0]] || '').trim().length >= 20 ? 'copy ✓' : 'review short copy' }}, {{ post.imageUrl ? 'media ✓' : 'no media attached' }}. Continue in Meta Business Suite after review.</span>
            <button :disabled="busyPostIds.includes(post.id) || Boolean(post.metadataWarning)" @click="approveForHandoff(post.id)">Approve &amp; open Meta Planner</button>
            <div class="review-actions"><button :disabled="Boolean(post.metadataWarning)" @click="reviewPost(post)">Edit copy</button><button @click="reviewPost(post, true)">Reject</button></div>
          </div>
          <div v-else-if="post.status === 'approved'" class="approval-row">
            <span>Approved for manual publishing. The app has not confirmed delivery.</span>
            <a :href="post.handoffUrl || 'https://business.facebook.com/latest/home'" target="_blank" rel="noopener noreferrer">Open Meta Planner</a>
            <button :disabled="Boolean(post.metadataWarning)" @click="confirmManual(post)">Confirm published…</button>
          </div>

          <div class="plat-chips">
            <button
              v-for="pId in post.platforms"
              :key="pId"
              class="mini-plat"
              @click="emit('openIntent', pId, post.variants?.[pId])"
              :disabled="post.status === 'pending_approval' || Boolean(post.metadataWarning)" :title="post.metadataWarning || (post.status === 'pending_approval' ? 'Approve this post before opening a channel' : `Open ${platformBadges[pId]?.label || pId}`)"
            >
              <PlatformIcon :platform="pId" :size="11" />
              <span>{{ platformBadges[pId]?.label.split(' ')[0] || pId }}</span>
              <ExternalLink :size="9" />
            </button>
          </div>

          <div v-if="post.webLink || post.imageUrl || post.hashtags?.length" class="post-media-pills">
            <span v-if="post.imageUrl" class="media-tag img-tag" title="Image Card Attached" style="display: inline-flex; align-items: center; gap: 3px;">
              <Image :size="10" />
              <span>Visual Card</span>
            </span>
            <a v-if="post.webLink" :href="post.webLink" target="_blank" class="media-tag link-tag" title="Target Link" style="display: inline-flex; align-items: center; gap: 3px;">
              <Link :size="10" />
              <span>{{ post.webLink.replace(/^https?:\/\//, '').split('/')[0] }}</span>
            </a>
            <span v-if="post.hashtags?.length" class="media-tag hash-tag" title="Target Hashtags" style="display: inline-flex; align-items: center; gap: 3px;">
              <Hash :size="10" />
              <span>{{ post.hashtags.slice(0, 3).join(' ') }}</span>
            </span>
          </div>

          <div class="post-meta">
            <span>{{ new Date(post.scheduledAt).toLocaleString() }}</span>
            <span v-if="post.deliveryLogs?.length">{{ post.deliveryLogs.length }} channels synced</span>
          </div>
        </div>
        <button v-if="postsQueue.length > 20" class="show-all-btn" @click="showAllPosts = !showAllPosts">
          {{ showAllPosts ? 'Show recent 20' : `Show all ${postsQueue.length} campaigns` }}
        </button>
      </div>
    </div>

    <PublisherQueueActivityPanel :activity-logs="activityLogs" :platform-badges="platformBadges" />
    </div>
  </div>
</template>

<style scoped>
.queue-split {
  display: grid;
  grid-template-columns: minmax(0, 1.15fr) minmax(0, 1fr);
  gap: 16px;
  width: 100%;
  max-width: 100%;
}
@media (max-width: 900px) {
  .queue-split { grid-template-columns: minmax(0, 1fr); }
}
.queue-card {
  min-width: 0;
  max-width: 100%;
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: 12px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.card-head {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}
.card-head h4 {
  margin: 0;
  font-size: 13px;
  font-weight: 700;
}
.empty-state { display: flex; flex-direction: column; align-items: flex-start; gap: 9px; padding: 22px 16px; border: 1px dashed var(--line); border-radius: 9px; color: var(--muted); font-size: 12px; }
.empty-state strong { color: var(--ink); font-size: 13px; }
.empty-state .show-all-btn { margin-top: 3px; background: var(--purple); border-color: var(--purple); color: white; }
.show-all-btn { align-self: flex-start; border: 1px solid var(--line); border-radius: 7px; padding: 7px 10px; background: transparent; color: var(--ink); font-size: 11px; cursor: pointer; }
.status-filter { background: var(--surface); border: 1px solid var(--line); color: var(--ink); border-radius: 7px; padding: 7px; }
.queue-search { background:var(--surface);border:1px solid var(--line);color:var(--ink);border-radius:7px;padding:8px; }
.review-actions { display:flex; align-items:center; gap:7px; }
.approval-row { display: flex; flex-direction: column; gap: 7px; font-size: 10px; color: var(--muted); }
.approval-row button, .approval-row a { align-self: flex-start; border: 0; border-radius: 6px; padding: 7px 9px; background: var(--purple); color: white; text-decoration: none; font-size: 10px; cursor: pointer; }
.post-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 440px;
  overflow-y: auto;
}
.post-item, .stream-row {
  background: var(--bg-app);
  border: 1px solid var(--line);
  border-radius: 9px;
  padding: 11px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.post-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
}
.post-title-wrap {
  display: flex;
  align-items: center;
  gap: 7px;
  font-size: 12px;
}
.state-chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 7px;
  border-radius: 999px;
  font-size: 9px;
  font-weight: 700;
  text-transform: uppercase;
}
.state-chip.green { background: rgba(16, 185, 129, 0.15); color: #10b981; }
.state-chip.amber { background: rgba(245, 158, 11, 0.15); color: #f59e0b; }
.del-btn {
  border: none;
  background: transparent;
  color: var(--muted);
  cursor: pointer;
}
.plat-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}
.mini-plat {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 8px;
  border-radius: 6px;
  border: 1px solid var(--line);
  background: var(--surface);
  font-size: 10px;
  font-weight: 600;
  cursor: pointer;
}
.post-media-pills {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  align-items: center;
}
.media-tag {
  display: inline-flex;
  align-items: center;
  font-size: 9px;
  padding: 2px 6px;
  border-radius: 4px;
  text-decoration: none;
}
.img-tag { background: rgba(56, 189, 248, 0.12); color: #38bdf8; }
.link-tag { background: rgba(168, 85, 247, 0.12); color: #c084fc; font-weight: 600; }
.hash-tag { background: rgba(16, 185, 129, 0.12); color: #34d399; }
.post-meta {
  display: flex;
  justify-content: space-between;
  font-size: 10px;
  color: var(--muted);
}
</style>
