<script setup lang="ts">
import { computed, ref } from 'vue'
import { Clock, Cpu, Flame, Rocket, Bot, RefreshCw, Send, Dices, Check, Bookmark, Minimize2, Wand2 } from 'lucide-vue-next'
import { summarizeCreativeText } from '../../domain/text-summarizer'
import { formatAestheticText, type AestheticPreset } from '../../domain/aesthetic-text'
import { applyCopyFramework, type CopyFrameworkId } from '../../domain/copy-frameworks'
import type { PlatformId } from '../../types'
import PlatformIcon from '../common/PlatformIcon.vue'
import PublisherAdvancedOptions from './PublisherAdvancedOptions.vue'
import PublisherFrameworkBar from './PublisherFrameworkBar.vue'
import type { ContentCategory, PlatformBadge, VaultAsset } from './publisher-types'

const props = defineProps<{
  brandName: string; loading: boolean; canPublish: boolean
  selectedPlatforms: PlatformId[]; availablePlatformIds: PlatformId[]; platformBadges: Record<PlatformId, PlatformBadge>
  topic: string; rawNotes: string; webLink: string; tags: string; tone: string; subreddit: string; scheduledAt: string
  includeCodeSnippet: boolean; categories: ContentCategory[]; selectedCategoryId: string | null; loadingCategory: boolean
  driveFolder: string; assets: VaultAsset[]; selectedAsset: string | null; draftingRandomPost: boolean
}>()

const emit = defineEmits<{
  (e: 'update:topic', value: string): void; (e: 'update:rawNotes', value: string): void
  (e: 'update:webLink', value: string): void; (e: 'update:tags', value: string): void
  (e: 'update:tone', value: string): void; (e: 'update:subreddit', value: string): void
  (e: 'update:scheduledAt', value: string): void; (e: 'update:includeCodeSnippet', value: boolean): void
  (e: 'applyPreset', preset: { topic: string; notes: string; link: string }): void
  (e: 'randomize'): void; (e: 'generate'): void; (e: 'togglePlatform', platform: PlatformId): void
  (e: 'submitPost', payload: { title: string; rawNotes: string; scheduledAt: string; publishNow: boolean; isDraft?: boolean; webLink: string; tags: string[] }): void
  (e: 'selectCategory', category: ContentCategory): void; (e: 'changeDriveFolder'): void; (e: 'selectVaultAsset', name: string): void
}>()

const aestheticStyle = ref<AestheticPreset>('editorial')
const presets = computed(() => [
  { icon: Rocket, label: 'Update', topic: `${props.brandName} product update`, notes: `Share a specific improvement or result from ${props.brandName}. Explain who benefits and how.`, link: '' },
  { icon: Bot, label: 'Launch', topic: `${props.brandName} launch`, notes: `Describe what ${props.brandName} launched, who it is for, and the next step.`, link: '' },
  { icon: Cpu, label: 'Case Study', topic: `${props.brandName} customer story`, notes: `Describe a customer problem, the solution, and the verified outcome.`, link: '' },
  { icon: Flame, label: 'Recap', topic: `${props.brandName} weekly recap`, notes: `Summarize this week's progress, one useful lesson, and what comes next.`, link: '' }
])

const nextStepGuidance = computed(() => {
  if (!props.topic.trim() || !props.rawNotes.trim()) return { step: '1/4', action: 'Write headline & notes' }
  if (props.rawNotes.length > 220) return { step: '2/4', action: 'Click Clean & TL;DR' }
  if (props.selectedPlatforms.length === 0) return { step: '3/4', action: 'Select channels' }
  return { step: '4/4', action: props.canPublish ? 'Ready to Publish' : 'Save Draft or Connect' }
})

function condenseAndDedupe() {
  const result = summarizeCreativeText(props.rawNotes, 3, aestheticStyle.value)
  if (result.tldr) { emit('update:topic', result.tldr.slice(0, 90)); emit('update:rawNotes', result.aestheticText); emit('generate') }
}

function cycleAestheticFormat() {
  const order: AestheticPreset[] = ['editorial', 'cyber_glyph', 'minimal_mono', 'punchy_hooks']
  aestheticStyle.value = order[(order.indexOf(aestheticStyle.value) + 1) % order.length]
  emit('update:rawNotes', formatAestheticText(props.rawNotes, aestheticStyle.value))
  emit('generate')
}

function applyFramework(id: CopyFrameworkId) {
  const out = applyCopyFramework(id, props.brandName, props.topic, props.rawNotes)
  emit('update:topic', out.topic)
  emit('update:rawNotes', out.notes)
  emit('generate')
}
</script>

<template>
  <div class="pub-card composer-form">
    <div class="pub-tabs">
      <button v-for="preset in presets" :key="preset.label" class="pub-tab-btn" @click="emit('applyPreset', preset)">
        <component :is="preset.icon" :size="13" /> {{ preset.label }}
      </button>
      <button class="pub-tab-btn active idea-button" :disabled="draftingRandomPost" title="Draft an idea" @click="emit('randomize')">
        <Dices :size="13" /> {{ draftingRandomPost ? 'Drafting...' : 'Idea' }}
      </button>
    </div>

    <PublisherFrameworkBar :disabled="loading" @select="applyFramework" />

    <input :value="topic" class="pub-input" placeholder="Post headline" @input="emit('update:topic', ($event.target as HTMLInputElement).value)" />
    <textarea :value="rawNotes" rows="3" class="pub-textarea" aria-label="Post details" placeholder="Paste raw notes (duplicates are removed automatically on TL;DR)" @input="emit('update:rawNotes', ($event.target as HTMLTextAreaElement).value)"></textarea>

    <PublisherAdvancedOptions
      :web-link="webLink" :tags="tags" :tone="tone" :subreddit="subreddit" :scheduled-at="scheduledAt" :include-code-snippet="includeCodeSnippet"
      :categories="categories" :selected-category-id="selectedCategoryId" :loading-category="loadingCategory"
      :drive-folder="driveFolder" :assets="assets" :selected-asset="selectedAsset"
      @update:web-link="emit('update:webLink', $event)" @update:tags="emit('update:tags', $event)"
      @update:tone="emit('update:tone', $event)" @update:subreddit="emit('update:subreddit', $event)"
      @update:scheduled-at="emit('update:scheduledAt', $event)" @update:include-code-snippet="emit('update:includeCodeSnippet', $event)"
      @select-category="emit('selectCategory', $event)" @change-drive-folder="emit('changeDriveFolder')"
      @select-vault-asset="emit('selectVaultAsset', $event)"
    />

    <div class="pub-row-between composer-generate-row">
      <span class="guided-step-rail" role="status"><i class="step-dot"></i><strong>{{ nextStepGuidance.step }}</strong> {{ nextStepGuidance.action }}</span>
      <div style="display: flex; gap: 6px; flex-wrap: wrap;">
        <button class="pub-btn" type="button" :class="{ 'next-action-pulse': rawNotes.length > 220 }" :disabled="loading || !rawNotes.trim()" title="Remove repeated lines & summarize into TL;DR" @click="condenseAndDedupe"><Minimize2 :size="13" /> Clean &amp; TL;DR</button>
        <button class="pub-btn" type="button" :disabled="loading || !rawNotes.trim()" title="Cycle aesthetic glyph bullets & typography" @click="cycleAestheticFormat"><Wand2 :size="13" /> Aesthetic</button>
        <button class="pub-btn" :disabled="loading" @click="emit('generate')"><RefreshCw :size="13" /> Adapt</button>
      </div>
    </div>

    <div class="channel-grid">
      <button v-for="platform in availablePlatformIds" :key="platform" class="pub-tab-btn" :class="{ active: selectedPlatforms.includes(platform) }" @click="emit('togglePlatform', platform)">
        <PlatformIcon :platform="platform" :size="13" />
        <span>{{ platformBadges[platform].label.split(' ')[0] }}</span>
        <Check v-if="selectedPlatforms.includes(platform)" :size="11" />
      </button>
    </div>

    <div class="composer-actions">
      <button class="pub-btn" :disabled="loading" @click="emit('submitPost', { title: topic, rawNotes, scheduledAt: '', publishNow: false, isDraft: true, webLink, tags: tags.split(',').map(tag => tag.trim()) })"><Bookmark :size="13" /> Draft</button>
      <button class="pub-btn" :disabled="loading || selectedPlatforms.length === 0" @click="emit('submitPost', { title: topic, rawNotes, scheduledAt, publishNow: false, isDraft: false, webLink, tags: tags.split(',').map(tag => tag.trim()) })"><Clock :size="13" /> Schedule</button>
      <button class="pub-btn primary" :disabled="loading || !canPublish" @click="emit('submitPost', { title: topic, rawNotes, scheduledAt, publishNow: true, isDraft: false, webLink, tags: tags.split(',').map(tag => tag.trim()) })"><Send :size="13" /> {{ canPublish ? `Publish (${selectedPlatforms.length})` : 'Connect' }}</button>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use './styles/publisher-shared.scss';
.composer-form { min-width: 0; }
.channel-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(110px, 1fr)); gap: 7px; }
.channel-grid .pub-tab-btn { min-width: 0; }
.composer-generate-row { justify-content: flex-end; }
.composer-actions { display: grid; grid-template-columns: 1fr 1fr 1.3fr; gap: 8px; margin-top: auto; }
.composer-actions .pub-btn { min-width: 0; width: 100%; white-space: normal; padding: 8px 6px; font-size: 11px; }
@media (max-width: 600px) { .channel-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } .composer-actions { grid-template-columns: 1fr; } }
</style>
