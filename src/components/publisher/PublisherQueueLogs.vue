<script setup lang="ts">
import { Trash2, ExternalLink, Calendar, CheckCircle2, Clock, Image, Link, Hash, Send } from 'lucide-vue-next'
import PlatformIcon from '../common/PlatformIcon.vue'
import { computed, ref } from 'vue'
import type { PlatformId, SocialPostItem } from '../../types'
import PublisherAutopilotTimeline from './PublisherAutopilotTimeline.vue'
import PublisherCampaignCalendar from './PublisherCampaignCalendar.vue'
import PublisherQueueActivityPanel from './PublisherQueueActivityPanel.vue'
import PublisherQueueMetadataWarning from './PublisherQueueMetadataWarning.vue'
import { exportQueueCsv, exportQueueJson } from './queue-export'
import { usePublisherQueueActions } from './usePublisherQueueActions'

const props = defineProps<{ postsQueue: SocialPostItem[]; activityLogs: any[]; platformBadges: Record<PlatformId, { icon: string; color: string; bg: string; label: string }>; searchQuery?: string }>()
const showAllPosts = ref(false)
const calendarMode = ref(false)
const calendarOffset = ref(0)
const filter = ref('all')
const visiblePosts = computed(() => {
  const q = (props.searchQuery || '').trim().toLowerCase()
  const matching = props.postsQueue.filter(post =>
    (filter.value === 'all' || post.status === filter.value) &&
    (!q || post.title.toLowerCase().includes(q) || post.platforms.some(platform => platform.includes(q)))
  )
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
  const response = await fetch('/api/social/posts/review', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ postId: post.id, brandId: post.brandId, reject, variants: reject ? undefined : { [post.platforms[0]]: text } })
  })
  if (response.ok) emit('refresh')
}

async function confirmManual(post: SocialPostItem) {
  const platformIds = post.platforms.filter(id => window.confirm(`Confirm this post is live on ${id}?`))
  if (!platformIds.length) return
  const externalUrl = window.prompt('Optional link to the published post:')
  const response = await fetch('/api/social/posts/confirm-manual', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ postId: post.id, brandId: post.brandId, platformIds, externalUrl })
  })
  if (response.ok) emit('refresh')
}
</script>

<template>
  <div class="pub-section">
    <PublisherQueueMetadataWarning :posts="postsQueue" />
    <details class="timeline-collapse">
      <summary><Clock :size="13" /><span>✦ 24h Schedule Timeline ({{ postsQueue.length }} queued)</span></summary>
      <PublisherAutopilotTimeline :posts="postsQueue" :platform-badges="platformBadges" />
    </details>

    <div class="queue-split">
      <div class="queue-card">
        <div class="card-head">
          <Calendar :size="15" /><h4>Queue ({{ postsQueue.length }})</h4>
          <button class="show-all-btn" @click="calendarMode = !calendarMode">{{ calendarMode ? 'List' : 'Calendar' }}</button>
          <button class="show-all-btn" @click="exportQueueJson(postsQueue)">JSON</button>
          <button class="show-all-btn" @click="exportQueueCsv(postsQueue)">CSV</button>
        </div>

        <div v-if="postsQueue.length === 0" class="empty-state">
          <Send :size="18" aria-hidden="true" /><strong>Queue empty</strong>
          <button class="show-all-btn" @click="emit('createPost')">Create post</button>
        </div>

        <PublisherCampaignCalendar v-if="calendarMode" :posts="postsQueue" :week-offset="calendarOffset" @update:week-offset="calendarOffset = $event" />
        <div v-else class="post-list">
          <select v-model="filter" aria-label="Filter campaigns by status" class="status-filter">
            <option value="all">All</option><option value="pending_approval">Review</option><option value="approved">Approved</option>
            <option value="scheduled">Scheduled</option><option value="published">Published</option><option value="failed">Failed</option>
          </select>
          <div v-for="post in visiblePosts" :key="post.id" class="post-item">
            <div class="post-top">
              <div class="post-title-wrap">
                <span class="state-chip" :class="post.status === 'published' ? 'green' : 'amber'">
                  <component :is="post.status === 'published' ? CheckCircle2 : Clock" :size="10" />{{ post.status }}
                </span>
                <strong>{{ post.title }}</strong>
              </div>
              <button class="del-btn" @click="emit('removePost', post.id)" title="Remove"><Trash2 :size="13" /></button>
              <button class="show-all-btn" :disabled="Boolean(post.metadataWarning)" @click="duplicatePost(post)">Clone</button>
            </div>
            <PublisherQueueMetadataWarning :post="post" />
            <div v-if="post.status === 'pending_approval'" class="approval-row">
              <span>✦ {{ post.title.trim() ? 'Title ✓' : 'Add title' }} · ◈ {{ (post.variants?.[post.platforms[0]] || '').trim().length >= 20 ? 'Copy ✓' : 'Short copy' }} · ▹ {{ post.imageUrl ? 'Media ✓' : 'No media' }}</span>
              <div class="review-actions">
                <button :disabled="busyPostIds.includes(post.id) || Boolean(post.metadataWarning)" @click="approveForHandoff(post.id)">Approve</button>
                <button :disabled="Boolean(post.metadataWarning)" @click="reviewPost(post)">Edit</button>
                <button @click="reviewPost(post, true)">Reject</button>
              </div>
            </div>
            <div v-else-if="post.status === 'approved'" class="approval-row">
              <div class="review-actions">
                <a :href="post.handoffUrl || 'https://business.facebook.com/latest/home'" target="_blank" rel="noopener noreferrer">Meta Planner</a>
                <button :disabled="Boolean(post.metadataWarning)" @click="confirmManual(post)">Confirm Live</button>
              </div>
            </div>

            <div class="plat-chips">
              <button v-for="pId in post.platforms" :key="pId" class="mini-plat" :disabled="post.status === 'pending_approval' || Boolean(post.metadataWarning)" @click="emit('openIntent', pId, post.variants?.[pId])">
                <PlatformIcon :platform="pId" :size="11" /><span>{{ platformBadges[pId]?.label.split(' ')[0] || pId }}</span><ExternalLink :size="9" />
              </button>
            </div>

            <div v-if="post.webLink || post.imageUrl || post.hashtags?.length" class="post-media-pills">
              <span v-if="post.imageUrl" class="media-tag img-tag"><Image :size="10" /> Card</span>
              <a v-if="post.webLink" :href="post.webLink" target="_blank" class="media-tag link-tag"><Link :size="10" /> {{ post.webLink.replace(/^https?:\/\//, '').split('/')[0] }}</a>
              <span v-if="post.hashtags?.length" class="media-tag hash-tag"><Hash :size="10" /> {{ post.hashtags.slice(0, 3).join(' ') }}</span>
            </div>

            <div class="post-meta">
              <span>{{ new Date(post.scheduledAt).toLocaleString() }}</span>
              <span v-if="post.deliveryLogs?.length">{{ post.deliveryLogs.length }} synced</span>
            </div>
          </div>
          <button v-if="postsQueue.length > 20" class="show-all-btn" @click="showAllPosts = !showAllPosts">{{ showAllPosts ? 'Recent 20' : `All ${postsQueue.length}` }}</button>
        </div>
      </div>

      <PublisherQueueActivityPanel :activity-logs="activityLogs" :platform-badges="platformBadges" />
    </div>
  </div>
</template>

<style scoped lang="scss">
@use './styles/publisher-queue-logs.scss';
</style>
