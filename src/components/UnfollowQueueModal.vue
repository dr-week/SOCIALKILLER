<script setup lang="ts">
import { ShieldAlert, Play, Pause, Square, Clock, ExternalLink, X, AlertTriangle } from 'lucide-vue-next'
import type { QueueItem } from '../composables/useUnfollowQueue'
import UnfollowQueueList from './unfollow-queue/UnfollowQueueList.vue'

defineProps<{
  isOpen: boolean
  queue: QueueItem[]
  isRunning: boolean
  isPaused: boolean
  currentIndex: number
  countdownSeconds: number
  completedCount: number
  pendingCount: number
  currentItem: QueueItem | null
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'start'): void
  (e: 'pause'): void
  (e: 'resume'): void
  (e: 'stop'): void
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
            <p>Anti-ban human pacing (15s–35s randomized interval)</p>
          </div>
        </div>
        <button class="close-btn" @click="emit('close')" aria-label="Close modal"><X :size="18" /></button>
      </div>

      <div class="queue-safety-banner">
        <AlertTriangle :size="16" class="safety-icon" />
        <span><strong>Anti-Bot Safety:</strong> Instagram flags robotic unfollow bursts. We enforce realistic human spacing between actions to keep your account 100% safe.</span>
      </div>

      <div v-if="currentItem && isRunning" class="current-target-card">
        <div class="target-meta">
          <span class="target-label">CURRENT TARGET ({{ currentIndex + 1 }} of {{ queue.length }})</span>
          <h4 class="target-username">@{{ currentItem.username }}</h4>
        </div>
        <div class="countdown-dial">
          <Clock :size="16" class="clock-icon" />
          <span>Next action in: <strong>{{ countdownSeconds }}s</strong></span>
        </div>
        <a :href="`https://www.instagram.com/${encodeURIComponent(currentItem.username)}/`" target="_blank" class="button button--outline button--tiny open-insta-btn">
          Open Profile <ExternalLink :size="12" />
        </a>
      </div>

      <div class="queue-stats-row">
        <div class="stat-pill"><span class="stat-val">{{ queue.length }}</span><span class="stat-lbl">Queued</span></div>
        <div class="stat-pill stat-pill--success"><span class="stat-val">{{ completedCount }}</span><span class="stat-lbl">Processed</span></div>
        <div class="stat-pill stat-pill--pending"><span class="stat-val">{{ pendingCount }}</span><span class="stat-lbl">Remaining</span></div>
      </div>

      <UnfollowQueueList :queue="queue" :current-index="currentIndex" :is-running="isRunning" />

      <div class="queue-footer">
        <div class="queue-actions">
          <button v-if="!isRunning && !isPaused && completedCount < queue.length" class="button button--primary" @click="emit('start')"><Play :size="14" /> Start Safe Queue</button>
          <button v-else-if="isRunning" class="button button--outline" @click="emit('pause')"><Pause :size="14" /> Pause Queue</button>
          <button v-else-if="isPaused" class="button button--primary" @click="emit('resume')"><Play :size="14" /> Resume Queue</button>
          <button v-if="isRunning || isPaused" class="button button--outline button--danger" @click="emit('stop')"><Square :size="14" /> Emergency Stop</button>
        </div>
        <button class="button button--outline" @click="emit('close')">Done / Close</button>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use './unfollow-queue/styles/unfollow-queue-layout.scss';
@use './unfollow-queue/styles/unfollow-queue-items.scss';
</style>
