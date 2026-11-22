<script setup lang="ts">
import {
  ShieldAlert, Play, Pause, Square, Clock, ExternalLink, X,
  AlertTriangle, Check, SkipForward, Star
} from 'lucide-vue-next'
import type { PacingPreset, QueueItem } from '../composables/useUnfollowQueue'
import UnfollowQueueControls from './unfollow-queue/UnfollowQueueControls.vue'
import UnfollowQueueList from './unfollow-queue/UnfollowQueueList.vue'

defineProps<{
  isOpen: boolean
  queue: QueueItem[]
  isRunning: boolean
  isPaused: boolean
  currentIndex: number
  countdownSeconds: number
  completedCount: number
  skippedCount: number
  pendingCount: number
  progressPercent: number
  minDelaySec: number
  maxDelaySec: number
  sessionLimit: number
  autoOpenProfile: boolean
  activePreset: PacingPreset
  currentItem: QueueItem | null
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'start'): void
  (e: 'pause'): void
  (e: 'resume'): void
  (e: 'stop'): void
  (e: 'skip'): void
  (e: 'markDone'): void
  (e: 'whitelistCurrent', username: string): void
  (e: 'removeItem', username: string): void
  (e: 'setPreset', preset: PacingPreset): void
  (e: 'update:sessionLimit', limit: number): void
  (e: 'update:autoOpenProfile', enabled: boolean): void
}>()
</script>

<template>
  <div v-if="isOpen" class="queue-overlay" @click.self="emit('close')">
    <div class="queue-modal">
      <div class="queue-header">
        <div class="queue-title-wrap">
          <div class="queue-icon-badge"><ShieldAlert :size="20" /></div>
          <div>
            <h3>Safe Unfollow Assistant</h3>
            <p>Human-paced review ({{ minDelaySec }}s–{{ maxDelaySec }}s interval · cap {{ sessionLimit }})</p>
          </div>
        </div>
        <button class="close-btn" @click="emit('close')" aria-label="Close modal"><X :size="18" /></button>
      </div>

      <div class="queue-safety-banner">
        <AlertTriangle :size="16" class="safety-icon" />
        <span><strong>Anti-Ban Safety:</strong> Open each profile, confirm unfollow manually on Instagram, or let the randomized timer pace your review safely.</span>
      </div>

      <UnfollowQueueControls
        :active-preset="activePreset" :min-delay-sec="minDelaySec" :max-delay-sec="maxDelaySec"
        :session-limit="sessionLimit" :auto-open-profile="autoOpenProfile"
        :progress-percent="progressPercent" :is-running="isRunning"
        @set-preset="emit('setPreset', $event)"
        @update:session-limit="emit('update:sessionLimit', $event)"
        @update:auto-open-profile="emit('update:autoOpenProfile', $event)"
      />

      <div v-if="currentItem && (isRunning || isPaused)" class="current-target-card target-card-expanded">
        <div class="target-top-row">
          <div class="target-meta">
            <span class="target-label">TARGET {{ currentIndex + 1 }} OF {{ queue.length }}</span>
            <h4 class="target-username">@{{ currentItem.username }}</h4>
          </div>
          <div class="countdown-dial">
            <Clock :size="15" class="clock-icon" />
            <span>{{ isPaused ? 'Paused' : `Next in ${countdownSeconds}s` }}</span>
          </div>
        </div>
        <div class="target-action-row">
          <a :href="`https://www.instagram.com/${encodeURIComponent(currentItem.username)}/#sk_review=1`" target="_blank" rel="noopener noreferrer" class="button button--primary button--tiny">
            Open Profile <ExternalLink :size="12" />
          </a>
          <button type="button" class="button button--outline button--tiny" @click="emit('markDone')">
            <Check :size="12" /> Done &amp; Next
          </button>
          <button type="button" class="button button--outline button--tiny" @click="emit('skip')">
            <SkipForward :size="12" /> Skip
          </button>
          <button type="button" class="button button--outline button--tiny" title="Protect in Safe List & skip" @click="emit('whitelistCurrent', currentItem.username)">
            <Star :size="12" /> Keep
          </button>
        </div>
      </div>

      <div class="queue-stats-row">
        <div class="stat-pill"><span class="stat-val">{{ queue.length }}</span><span class="stat-lbl">Queued</span></div>
        <div class="stat-pill stat-pill--success"><span class="stat-val">{{ completedCount }}</span><span class="stat-lbl">Done</span></div>
        <div class="stat-pill"><span class="stat-val">{{ skippedCount }}</span><span class="stat-lbl">Skipped</span></div>
        <div class="stat-pill stat-pill--pending"><span class="stat-val">{{ pendingCount }}</span><span class="stat-lbl">Left</span></div>
      </div>

      <UnfollowQueueList :queue="queue" :current-index="currentIndex" :is-running="isRunning" @remove="emit('removeItem', $event)" />

      <div class="queue-footer">
        <div class="queue-actions">
          <button v-if="!isRunning && !isPaused && pendingCount > 0" class="button button--primary" @click="emit('start')"><Play :size="14" /> Start Safe Queue</button>
          <button v-else-if="isRunning" class="button button--outline" @click="emit('pause')"><Pause :size="14" /> Pause</button>
          <button v-else-if="isPaused" class="button button--primary" @click="emit('resume')"><Play :size="14" /> Resume</button>
          <button v-if="isRunning || isPaused" class="button button--outline button--danger" @click="emit('stop')"><Square :size="14" /> Stop</button>
        </div>
        <button class="button button--outline" @click="emit('close')">Done / Close</button>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use './unfollow-queue/styles/unfollow-queue-layout.scss';
@use './unfollow-queue/styles/unfollow-queue-items.scss';
.target-card-expanded { flex-direction: column; align-items: stretch; gap: 10px; }
.target-top-row { display: flex; align-items: center; justify-content: space-between; gap: 10px; }
.target-action-row { display: flex; flex-wrap: wrap; gap: 6px; }
</style>
