<script setup lang="ts">
import { computed, ref } from 'vue'
import { Check, Copy, ExternalLink, Eye, PenTool, ThumbsDown, ThumbsUp } from 'lucide-vue-next'
import { predictViralReach } from '../../domain/analytics/viral-predictor'
import type { PlatformId } from '../../types'
import PlatformIcon from '../common/PlatformIcon.vue'
import PublisherFeedPreview from './PublisherFeedPreview.vue'
import type { PlatformBadge } from './publisher-types'

const props = defineProps<{
  activePlatform: PlatformId
  selectedPlatforms?: PlatformId[]
  brandName: string
  topic: string
  platformBadges: Record<PlatformId, PlatformBadge>
  generatedVariants: Record<PlatformId, string>
  webLink: string
  previewCover: string | null
  randomDraftId: string | null
  draftingRandomPost: boolean
  randomDraftFeedback: 'like' | 'dislike' | null
  sendingRandomFeedback: boolean
}>()

const previewPlatforms = computed(() => {
  if (props.selectedPlatforms && props.selectedPlatforms.length > 0) return props.selectedPlatforms
  return Object.keys(props.platformBadges) as PlatformId[]
})

const emit = defineEmits<{
  (e: 'update:activePlatform', platform: PlatformId): void
  (e: 'updateVariant', platform: PlatformId, text: string): void
  (e: 'clearRandomDraftFeedback'): void
  (e: 'rateRandomDraft', feedback: 'like' | 'dislike'): void
  (e: 'openIntent', platform: PlatformId, text: string): void
  (e: 'showToast', message: string): void
}>()

const viewMode = ref<'editor' | 'preview'>('preview')
const copiedKey = ref<PlatformId | null>(null)
const activeText = computed({
  get: () => props.generatedVariants[props.activePlatform] || '',
  set: (text: string) => emit('updateVariant', props.activePlatform, text)
})
const score = computed(() => predictViralReach(activeText.value || props.topic))

function copyVariant() {
  navigator.clipboard.writeText(activeText.value)
  copiedKey.value = props.activePlatform
  emit('showToast', `Copied ${props.platformBadges[props.activePlatform].label} post!`)
  setTimeout(() => { copiedKey.value = null }, 1800)
}
</script>

<template>
  <div class="pub-card preview-card">
    <div class="pub-tabs preview-platforms">
      <button v-for="platform in previewPlatforms" :key="platform" class="pub-tab-btn" :class="{ active: activePlatform === platform }" @click="emit('update:activePlatform', platform)">
        <PlatformIcon :platform="platform" :size="13" />
        <span>{{ platformBadges[platform].label.split(' ')[0] }}</span>
      </button>
    </div>

    <div class="pub-row-between preview-heading">
      <div class="pub-tabs">
        <button class="pub-tab-btn" :class="{ active: viewMode === 'editor' }" @click="viewMode = 'editor'"><PenTool :size="12" /> Editor</button>
        <button class="pub-tab-btn" :class="{ active: viewMode === 'preview' }" @click="viewMode = 'preview'"><Eye :size="12" /> Preview</button>
      </div>
      <details class="preview-score">
        <summary>Scores</summary>
        <div class="pub-tabs">
          <span class="pub-pill green">{{ score.overallScore }}% overall</span>
          <span class="pub-pill blue">{{ score.hookScore }}% hook</span>
          <span class="pub-pill amber">{{ activeText.length }} chars</span>
        </div>
      </details>
    </div>

    <img v-if="previewCover" class="preview-cover" :src="previewCover" alt="Draft cover card" />
    <textarea v-if="viewMode === 'editor'" v-model="activeText" rows="9" class="pub-textarea preview-editor" @input="emit('clearRandomDraftFeedback')"></textarea>
    <PublisherFeedPreview
      v-else
      :platform="activePlatform"
      :brand-name="brandName"
      :content="activeText"
      :web-link="webLink"
      :media-url="previewCover || undefined"
      :badge="platformBadges[activePlatform]"
      :character-count="activeText.length"
      :max-characters="activePlatform === 'x' ? 280 : undefined"
      class="feed-preview"
    />

    <div v-if="randomDraftId && !draftingRandomPost" class="pub-row-between rating-actions" aria-label="Rate this generated draft">
      <span>Helpful?</span>
      <button class="pub-btn" :class="{ active: randomDraftFeedback === 'like' }" :aria-pressed="randomDraftFeedback === 'like'" :disabled="sendingRandomFeedback" title="Use more drafts like this" @click="emit('rateRandomDraft', 'like')"><ThumbsUp :size="13" /></button>
      <button class="pub-btn" :class="{ active: randomDraftFeedback === 'dislike' }" :aria-pressed="randomDraftFeedback === 'dislike'" :disabled="sendingRandomFeedback" title="Use fewer drafts like this" @click="emit('rateRandomDraft', 'dislike')"><ThumbsDown :size="13" /></button>
    </div>

    <div class="preview-actions">
      <button class="pub-btn" @click="copyVariant"><component :is="copiedKey === activePlatform ? Check : Copy" :size="13" /> {{ copiedKey === activePlatform ? 'Copied' : 'Copy' }}</button>
      <button class="pub-btn primary" @click="emit('openIntent', activePlatform, activeText)"><ExternalLink :size="13" /> 1-Click {{ platformBadges[activePlatform].label.split(' ')[0] }}</button>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use './styles/publisher-shared.scss';
.preview-card { width: 100%; }
.preview-platforms { display: grid; grid-template-columns: repeat(auto-fit, minmax(78px, 1fr)); }
.preview-heading { min-width: 0; flex-wrap: wrap; }
.preview-score { flex-shrink: 0; }
.preview-score summary { color: var(--muted); cursor: pointer; font-size: 10px; }
.preview-score .pub-tabs { justify-content: flex-end; padding-top: 6px; }
.preview-cover { width: 100%; max-height: 140px; border: 1px solid var(--line); border-radius: 8px; object-fit: cover; }
.preview-editor { min-width: 0; flex: 1; font-family: monospace; }
.feed-preview { min-width: 0; flex: 1; overflow-y: auto; }
.rating-actions span { color: var(--muted); font-size: 11px; }
.preview-actions { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1.5fr); gap: 8px; }
.preview-actions .pub-btn { min-width: 0; width: 100%; }
@media (max-width: 560px) { .preview-actions { grid-template-columns: 1fr; } }
</style>
