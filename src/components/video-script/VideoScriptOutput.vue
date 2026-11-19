<script setup lang="ts">
import { ref } from 'vue'
import { Copy, Check, Film, Tv, Flame } from 'lucide-vue-next'
import type { VideoScript } from '../../types/brand'

const props = defineProps<{ currentScript: VideoScript }>()
const viewMode = ref<'beats' | 'teleprompter'>('beats')
const copied = ref(false)
async function copyScript() {
  const text = viewMode.value === 'teleprompter' ? props.currentScript.teleprompterText : props.currentScript.fullText
  if (!text) return
  await navigator.clipboard.writeText(text)
  copied.value = true
  setTimeout(() => { copied.value = false }, 2000)
}
</script>

<template>
    <!-- Script Output Canvas -->
    <div v-if="currentScript" class="script-output-card">
      <div class="output-topbar">
        <div class="script-meta">
          <span class="retention-score" style="display: inline-flex; align-items: center; gap: 4px;">
            <Flame :size="11" />
            <span>Retention Score: {{ currentScript.retentionScore }}%</span>
          </span>
          <span class="format-pill">{{ currentScript.durationEstimate }}</span>
          <span class="pillar-pill">{{ currentScript.pillar.replace('_', ' ') }}</span>
        </div>

        <div class="output-actions">
          <div class="view-toggle">
            <button
              class="toggle-btn"
              :class="{ active: viewMode === 'beats' }"
              @click="viewMode = 'beats'"
            >
              <Film :size="12" /> Beats & Stage Directions
            </button>
            <button
              class="toggle-btn"
              :class="{ active: viewMode === 'teleprompter' }"
              @click="viewMode = 'teleprompter'"
            >
              <Tv :size="12" /> Teleprompter
            </button>
          </div>

          <button class="copy-btn" @click="copyScript">
            <component :is="copied ? Check : Copy" :size="13" />
            <span>{{ copied ? 'Copied!' : 'Copy Script' }}</span>
          </button>
        </div>
      </div>

      <!-- Mode 1: Stage Directions & Beats -->
      <div v-if="viewMode === 'beats'" class="beats-container">
        <div
          v-for="beat in currentScript.beats"
          :key="beat.marker"
          class="beat-card"
          :class="beat.marker.toLowerCase()"
        >
          <div class="beat-header">
            <span class="marker-chip">{{ beat.marker }}</span>
            <span class="time-chip">{{ beat.timecode }}</span>
          </div>

          <div class="cues-box">
            <span class="cue visual-cue">{{ beat.visual }}</span>
            <span class="cue audio-cue">{{ beat.audio }}</span>
          </div>

          <p class="narration-line">"{{ beat.narration }}"</p>
        </div>
      </div>

      <!-- Mode 2: Clean Teleprompter -->
      <div v-else class="teleprompter-view">
        <p class="teleprompter-text">{{ currentScript.teleprompterText }}</p>
      </div>
    </div>
</template>
