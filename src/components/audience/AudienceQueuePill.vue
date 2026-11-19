<script setup lang="ts">
import { CheckCircle2, Clock, Maximize2, Pause, Play } from 'lucide-vue-next'

defineProps<{
  isRunning: boolean
  isPaused: boolean
  completedCount: number
  totalCount: number
  countdownSeconds: number
  currentUser?: string
}>()

const emit = defineEmits<{
  (e: 'maximize'): void
  (e: 'pause'): void
  (e: 'resume'): void
}>()
</script>

<template>
  <div class="queue-floating-pill" role="region" aria-label="Background queue status">
    <div class="pill-left">
      <div class="pill-pulse" :class="{ 'is-paused': isPaused }"></div>
      <Clock v-if="isRunning" :size="13" class="pill-icon spin-icon" />
      <CheckCircle2 v-else :size="13" class="pill-icon text-emerald" />
      <span class="pill-status">
        <strong>{{ completedCount }}/{{ totalCount }}</strong>
        <template v-if="currentUser"> • @{{ currentUser }} ({{ countdownSeconds }}s)</template>
      </span>
    </div>

    <div class="pill-controls">
      <button v-if="isRunning" class="pill-btn" title="Pause Queue" aria-label="Pause Queue" @click.stop="emit('pause')">
        <Pause :size="12" />
      </button>
      <button v-else-if="isPaused" class="pill-btn" title="Resume Queue" aria-label="Resume Queue" @click.stop="emit('resume')">
        <Play :size="12" />
      </button>
      <button class="pill-btn pill-btn--maximize" title="Maximize Unfollow Queue" aria-label="Maximize Unfollow Queue" @click.stop="emit('maximize')">
        <Maximize2 :size="12" />
      </button>
    </div>
  </div>
</template>

<style scoped lang="scss" src="./styles/audience-queue-pill.scss"></style>
