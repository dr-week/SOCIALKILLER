<script setup lang="ts">
import { Gauge, ShieldCheck, ExternalLink } from 'lucide-vue-next'
import type { PacingPreset } from '../../composables/useUnfollowQueue'

defineProps<{
  activePreset: PacingPreset
  minDelaySec: number
  maxDelaySec: number
  sessionLimit: number
  autoOpenProfile: boolean
  progressPercent: number
  isRunning: boolean
}>()

const emit = defineEmits<{
  (e: 'setPreset', preset: PacingPreset): void
  (e: 'update:sessionLimit', limit: number): void
  (e: 'update:autoOpenProfile', enabled: boolean): void
}>()

const PRESETS: Array<{ id: PacingPreset; label: string; range: string }> = [
  { id: 'ultra', label: 'Ultra Safe', range: '30–60s' },
  { id: 'balanced', label: 'Balanced', range: '15–35s' },
  { id: 'fast', label: 'Quick', range: '8–18s' }
]
const CAPS = [10, 25, 50]
</script>

<template>
  <div class="queue-controls-panel">
    <div class="controls-row">
      <div class="control-group">
        <span class="control-label"><Gauge :size="12" /> Pacing</span>
        <div class="pill-group">
          <button
            v-for="p in PRESETS"
            :key="p.id"
            type="button"
            class="ctrl-pill"
            :class="{ active: activePreset === p.id }"
            :disabled="isRunning"
            @click="emit('setPreset', p.id)"
          >
            {{ p.label }} <small>{{ p.range }}</small>
          </button>
        </div>
      </div>

      <div class="control-group">
        <span class="control-label"><ShieldCheck :size="12" /> Cap</span>
        <div class="pill-group">
          <button
            v-for="cap in CAPS"
            :key="cap"
            type="button"
            class="ctrl-pill"
            :class="{ active: sessionLimit === cap }"
            :disabled="isRunning"
            @click="emit('update:sessionLimit', cap)"
          >
            {{ cap }}
          </button>
        </div>
      </div>
    </div>

    <div class="controls-subrow">
      <label class="auto-open-toggle">
        <input
          type="checkbox"
          :checked="autoOpenProfile"
          @change="emit('update:autoOpenProfile', ($event.target as HTMLInputElement).checked)"
        />
        <ExternalLink :size="12" />
        <span>Auto-open Instagram profile tab for each target</span>
      </label>
      <span class="progress-pct">{{ progressPercent }}%</span>
    </div>

    <div class="progress-track" role="progressbar" :aria-valuenow="progressPercent" aria-valuemin="0" aria-valuemax="100">
      <div class="progress-fill" :style="{ width: `${progressPercent}%` }"></div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.queue-controls-panel {
  margin: 12px 20px 0;
  padding: 12px 14px;
  background: var(--surface-muted);
  border: 1px solid var(--border);
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.controls-row { display: flex; justify-content: space-between; gap: 10px; flex-wrap: wrap; }
.control-group { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
.control-label {
  display: inline-flex; align-items: center; gap: 4px;
  font-size: 11px; font-weight: 700; color: var(--muted);
}
.pill-group { display: inline-flex; gap: 4px; }
.ctrl-pill {
  border: 1px solid var(--border); background: var(--surface); color: var(--text);
  border-radius: 999px; padding: 3px 8px; font-size: 11px; font-weight: 600; cursor: pointer;
  small { opacity: 0.7; font-weight: 500; }
  &.active { border-color: var(--primary); background: rgba(99, 102, 241, 0.16); color: var(--primary); }
  &:disabled { opacity: 0.5; cursor: not-allowed; }
}
.controls-subrow { display: flex; align-items: center; justify-content: space-between; font-size: 11.5px; }
.auto-open-toggle { display: inline-flex; align-items: center; gap: 6px; color: var(--text); cursor: pointer; }
.progress-pct { font-weight: 700; color: var(--primary); font-variant-numeric: tabular-nums; }
.progress-track { height: 5px; background: var(--surface); border-radius: 999px; overflow: hidden; }
.progress-fill { height: 100%; background: linear-gradient(90deg, #6366f1, #10b981); transition: width 0.25s ease; }
</style>
