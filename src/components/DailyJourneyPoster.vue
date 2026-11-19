<script setup lang="ts">
import { ref } from 'vue'
import { Sparkles, Copy, Check } from 'lucide-vue-next'
import PlatformIcon from './common/PlatformIcon.vue'
import type { DailyJourneyStory } from '../types/brand'

const props = defineProps<{
  currentJourney: DailyJourneyStory | null
  generating: boolean
}>()

const emit = defineEmits<{
  (e: 'generate', payload: { topic?: string; milestoneId?: string }): void
}>()

const customTopic = ref('')
const selectedChannel = ref<'x' | 'linkedin' | 'reddit'>('x')
const copied = ref(false)

function onGenerate() {
  emit('generate', { topic: customTopic.value })
}

function copyContent() {
  let text = ''
  if (!props.currentJourney) return
  if (selectedChannel.value === 'x') text = props.currentJourney.channels.x
  else if (selectedChannel.value === 'linkedin') text = props.currentJourney.channels.linkedin
  else if (selectedChannel.value === 'reddit') text = `${props.currentJourney.channels.reddit.title}\n\n${props.currentJourney.channels.reddit.body}`

  if (text) {
    navigator.clipboard.writeText(text)
    copied.value = true
    setTimeout(() => { copied.value = false }, 2000)
  }
}
</script>

<template>
  <div class="daily-journey-wrap">
    <!-- Generator Controls -->
    <div class="journey-controls-card">
      <div class="journey-input-row">
        <label class="journey-prompt">
          <span>Today's milestone <small>Optional</small></span>
          <input
          v-model="customTopic"
          type="text"
          class="journey-input"
          placeholder="e.g. Shipped a feature, fixed a memory leak"
          />
        </label>
        <button
          class="generate-btn"
          @click="onGenerate"
          :disabled="generating"
        >
          <Sparkles :size="13" />
          <span>{{ generating ? 'Generating…' : 'Generate stories' }}</span>
        </button>
      </div>
    </div>

    <!-- Generated Stories Output -->
    <div v-if="currentJourney" class="journey-output-card">
      <div class="channel-tabs">
        <button
          class="tab-btn"
          :class="{ active: selectedChannel === 'x' }"
          @click="selectedChannel = 'x'"
        >
          <PlatformIcon platform="x" :size="13" />
          <span>X / Twitter</span>
        </button>
        <button
          class="tab-btn"
          :class="{ active: selectedChannel === 'linkedin' }"
          @click="selectedChannel = 'linkedin'"
        >
          <PlatformIcon platform="linkedin" :size="13" />
          <span>LinkedIn Reflection</span>
        </button>
        <button
          class="tab-btn"
          :class="{ active: selectedChannel === 'reddit' }"
          @click="selectedChannel = 'reddit'"
        >
          <PlatformIcon platform="reddit" :size="13" />
          <span>Reddit ({{ currentJourney.channels.reddit.subreddit }})</span>
        </button>

        <div style="flex: 1"></div>

        <button class="action-btn" @click="copyContent">
          <component :is="copied ? Check : Copy" :size="13" />
          <span>{{ copied ? 'Copied' : 'Copy' }}</span>
        </button>
      </div>

      <div class="story-canvas">
        <div v-if="selectedChannel === 'x'" class="x-view">
          <p class="story-text">{{ currentJourney.channels.x }}</p>
        </div>

        <div v-else-if="selectedChannel === 'linkedin'" class="linkedin-view">
          <p class="story-text">{{ currentJourney.channels.linkedin }}</p>
        </div>

        <div v-else-if="selectedChannel === 'reddit'" class="reddit-view">
          <div class="reddit-sub-pill">{{ currentJourney.channels.reddit.subreddit }}</div>
          <h4 class="reddit-title">{{ currentJourney.channels.reddit.title }}</h4>
          <p class="story-text">{{ currentJourney.channels.reddit.body }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.daily-journey-wrap {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.journey-controls-card {
  background: var(--surface-card);
  border: 1px solid var(--surface-border);
  border-left: 3px solid var(--purple);
  border-radius: 12px;
  padding: 18px;
  box-shadow: var(--card-shadow);
}

.journey-input-row {
  display: flex;
  align-items: end;
  gap: 12px;
  flex-wrap: wrap;
}

.journey-prompt {
  display: grid;
  flex: 1;
  min-width: 240px;
  gap: 7px;
  color: var(--ink);
  font-size: 11px;
  font-weight: 700;

  small { margin-left: 5px; color: var(--muted); font-size: 10px; font-weight: 400; }
}

.journey-input {
  width: 100%;
  min-height: 42px;
  background: var(--input-bg);
  border: 1px solid var(--surface-border);
  border-radius: 8px;
  padding: 10px 12px;
  color: var(--ink);
  font-size: 12px;
  outline: none;

  &:focus {
    border-color: var(--purple);
    box-shadow: 0 0 0 3px var(--purple-soft);
  }
}

.generate-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-height: 42px;
  padding: 0 16px;
  border-radius: 8px;
  background: var(--purple);
  color: #fff;
  font-size: 12px;
  font-weight: 700;
  border: none;
  cursor: pointer;
  transition: filter 0.15s ease;

  &:hover:not(:disabled) {
    filter: brightness(1.1);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
}

.journey-output-card {
  background: var(--surface-card);
  border: 1px solid var(--surface-border);
  border-radius: 12px;
  padding: 18px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  box-shadow: var(--card-shadow);
}

.channel-tabs {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
  border-bottom: 1px solid var(--surface-border);
  padding-bottom: 12px;
}

.tab-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 5px 10px;
  border-radius: 7px;
  border: 1px solid var(--surface-border);
  background: var(--surface-raised);
  color: var(--muted);
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;

  &.active {
    background: var(--purple-soft);
    border-color: var(--purple);
    color: var(--purple);
  }
}

.action-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  border-radius: 6px;
  border: 1px solid var(--surface-border);
  background: transparent;
  color: var(--ink);
  font-size: 11px;
  cursor: pointer;

  &:hover {
    background: var(--surface-raised);
  }
}

.story-canvas {
  background: var(--input-bg);
  border: 1px solid var(--surface-border);
  border-radius: 8px;
  padding: 14px;
}

.story-text {
  margin: 0;
  font-size: 12.5px;
  line-height: 1.6;
  color: var(--ink);
  white-space: pre-wrap;
  font-family: inherit;
}

.reddit-view {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.reddit-sub-pill {
  font-size: 10px;
  color: #ff4500;
  font-weight: 700;
}

.reddit-title {
  margin: 0;
  font-size: 13.5px;
  font-weight: 700;
  color: var(--ink);
}

@media (max-width: 640px) {
  .journey-controls-card, .journey-output-card { padding: 14px; }
  .journey-input-row { align-items: stretch; }
  .generate-btn { justify-content: center; }
}
</style>
