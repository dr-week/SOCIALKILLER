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
        <button class="generate-btn" @click="onGenerate" :disabled="generating">
          <Sparkles :size="13" />
          <span>{{ generating ? 'Generating…' : 'Generate stories' }}</span>
        </button>
      </div>
    </div>

    <div v-if="currentJourney" class="journey-output-card">
      <div class="channel-tabs">
        <button class="tab-btn" :class="{ active: selectedChannel === 'x' }" @click="selectedChannel = 'x'">
          <PlatformIcon platform="x" :size="13" />
          <span>X / Twitter</span>
        </button>
        <button class="tab-btn" :class="{ active: selectedChannel === 'linkedin' }" @click="selectedChannel = 'linkedin'">
          <PlatformIcon platform="linkedin" :size="13" />
          <span>LinkedIn Reflection</span>
        </button>
        <button class="tab-btn" :class="{ active: selectedChannel === 'reddit' }" @click="selectedChannel = 'reddit'">
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
@use './video-script/styles/daily-journey-poster.scss';
</style>
