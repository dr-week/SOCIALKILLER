<script setup lang="ts">
import { CheckCircle2, Clock } from 'lucide-vue-next'
import type { QueueItem } from '../../composables/useUnfollowQueue'

defineProps<{
  queue: QueueItem[]
  currentIndex: number
  isRunning: boolean
}>()
</script>

<template>
  <div class="queue-list-container">
    <div
      v-for="(item, idx) in queue"
      :key="item.username"
      class="queue-item-row"
      :class="{
        'queue-item--active': idx === currentIndex && isRunning,
        'queue-item--done': item.status === 'completed'
      }"
    >
      <div class="item-left">
        <span class="item-idx">{{ idx + 1 }}</span>
        <span class="item-user">@{{ item.username }}</span>
      </div>
      <div class="item-status">
        <span v-if="item.status === 'completed'" class="status-pill status-pill--done">
          <CheckCircle2 :size="12" /> Done
        </span>
        <span v-else-if="item.status === 'processing'" class="status-pill status-pill--active">
          <Clock :size="12" class="spin-icon" /> Pacing...
        </span>
        <span v-else class="status-pill status-pill--pending">
          Queued
        </span>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use './styles/unfollow-queue-items.scss';
</style>
