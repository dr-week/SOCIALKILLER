<script setup lang="ts">
import { CheckCircle2, Clock, ExternalLink, SkipForward, X } from 'lucide-vue-next'
import type { QueueItem } from '../../composables/useUnfollowQueue'

defineProps<{
  queue: QueueItem[]
  currentIndex: number
  isRunning: boolean
}>()

const emit = defineEmits<{ (e: 'remove', username: string): void }>()
</script>

<template>
  <div class="queue-list-container">
    <div
      v-for="(item, idx) in queue"
      :key="item.username"
      class="queue-item-row"
      :class="{
        'queue-item--active': idx === currentIndex && isRunning,
        'queue-item--done': item.status === 'completed' || item.status === 'skipped'
      }"
    >
      <div class="item-left">
        <span class="item-idx">{{ idx + 1 }}</span>
        <a
          class="item-user"
          :href="`https://www.instagram.com/${encodeURIComponent(item.username)}/`"
          target="_blank"
          rel="noopener noreferrer"
          title="Open Instagram profile"
        >
          @{{ item.username }} <ExternalLink :size="10" />
        </a>
      </div>
      <div class="item-status">
        <span v-if="item.status === 'completed'" class="status-pill status-pill--done">
          <CheckCircle2 :size="12" /> Done
        </span>
        <span v-else-if="item.status === 'skipped'" class="status-pill status-pill--pending">
          <SkipForward :size="12" /> Skipped
        </span>
        <span v-else-if="item.status === 'processing'" class="status-pill status-pill--active">
          <Clock :size="12" class="spin-icon" /> Pacing...
        </span>
        <template v-else>
          <span class="status-pill status-pill--pending">Queued</span>
          <button
            type="button"
            class="row-remove-btn"
            title="Remove from queue"
            aria-label="Remove from queue"
            @click="emit('remove', item.username)"
          >
            <X :size="12" />
          </button>
        </template>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use './styles/unfollow-queue-items.scss';
.item-user {
  color: inherit;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  &:hover { color: var(--primary); }
}
.item-status { display: inline-flex; align-items: center; gap: 6px; }
.row-remove-btn {
  background: none; border: none; color: var(--muted); cursor: pointer;
  padding: 2px; border-radius: 4px; display: inline-flex; align-items: center;
  &:hover { color: #ef4444; background: rgba(239, 68, 68, 0.1); }
}
</style>
