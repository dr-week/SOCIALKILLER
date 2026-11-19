<script setup lang="ts">
import {
  Clock,
  Play,
  Pause,
  Maximize2,
  CheckCircle2
} from 'lucide-vue-next'

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
      <Clock :size="13" class="pill-icon spin-icon" v-if="isRunning" />
      <CheckCircle2 :size="13" class="pill-icon text-emerald" v-else />
      <span class="pill-status">
        <strong>{{ completedCount }}/{{ totalCount }}</strong>
        <template v-if="currentUser"> • @{{ currentUser }} ({{ countdownSeconds }}s)</template>
      </span>
    </div>

    <div class="pill-controls">
      <button
        v-if="isRunning"
        class="pill-btn"
        @click.stop="emit('pause')"
        title="Pause Queue"
        aria-label="Pause Queue"
      >
        <Pause :size="12" />
      </button>
      <button
        v-else-if="isPaused"
        class="pill-btn"
        @click.stop="emit('resume')"
        title="Resume Queue"
        aria-label="Resume Queue"
      >
        <Play :size="12" />
      </button>

      <button
        class="pill-btn pill-btn--maximize"
        @click.stop="emit('maximize')"
        title="Maximize Unfollow Queue"
        aria-label="Maximize Unfollow Queue"
      >
        <Maximize2 :size="12" />
      </button>
    </div>
  </div>
</template>

<style scoped lang="scss">
.queue-floating-pill {
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 98;
  background: var(--surface-card, #131722);
  border: 1px solid rgba(239, 68, 68, 0.4);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.4), 0 0 15px rgba(239, 68, 68, 0.2);
  border-radius: 30px;
  padding: 6px 12px 6px 14px;
  display: flex;
  align-items: center;
  gap: 12px;
  backdrop-filter: blur(10px);
  animation: slideInRight 0.25s ease;
}

.pill-left {
  display: flex;
  align-items: center;
  gap: 7px;
}

.pill-pulse {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #ef4444;
  box-shadow: 0 0 8px #ef4444;
  animation: pulse 1.5s infinite;

  &.is-paused {
    background: #f59e0b;
    box-shadow: 0 0 8px #f59e0b;
    animation: none;
  }
}

.pill-status {
  font-size: 11.5px;
  color: var(--ink, #fff);
  white-space: nowrap;
}

.pill-controls {
  display: flex;
  align-items: center;
  gap: 4px;
}

.pill-btn {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.05);
  color: var(--muted, #94a3b8);
  display: grid;
  place-items: center;
  cursor: pointer;
  transition: all 0.15s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.15);
    color: #fff;
  }

  &--maximize {
    color: #38bdf8;
    &:hover { background: rgba(56, 189, 248, 0.2); }
  }
}

@keyframes pulse {
  0% { transform: scale(0.9); opacity: 0.7; }
  50% { transform: scale(1.15); opacity: 1; }
  100% { transform: scale(0.9); opacity: 0.7; }
}

@keyframes slideInRight {
  from { transform: translateX(20px); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}
</style>
