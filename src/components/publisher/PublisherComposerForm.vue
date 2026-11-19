<script setup lang="ts">
import { computed } from 'vue'
import { Clock, Cpu, Flame, Rocket, Bot, RefreshCw, Send, Dices, Check, Bookmark } from 'lucide-vue-next'
import type { PlatformId } from '../../types'
import PlatformIcon from '../common/PlatformIcon.vue'
import PublisherAdvancedOptions from './PublisherAdvancedOptions.vue'
import type { ContentCategory, PlatformBadge, VaultAsset } from './publisher-types'

const props = defineProps<{
  brandName: string
  loading: boolean
  canPublish: boolean
  selectedPlatforms: PlatformId[]
  availablePlatformIds: PlatformId[]
  platformBadges: Record<PlatformId, PlatformBadge>
  topic: string
  rawNotes: string
  webLink: string
  tags: string
  tone: string
  subreddit: string
  scheduledAt: string
  includeCodeSnippet: boolean
  categories: ContentCategory[]
  selectedCategoryId: string | null
  loadingCategory: boolean
  driveFolder: string
  assets: VaultAsset[]
  selectedAsset: string | null
  draftingRandomPost: boolean
}>()

const emit = defineEmits<{
  (e: 'update:topic', value: string): void
  (e: 'update:rawNotes', value: string): void
  (e: 'update:webLink', value: string): void
  (e: 'update:tags', value: string): void
  (e: 'update:tone', value: string): void
  (e: 'update:subreddit', value: string): void
  (e: 'update:scheduledAt', value: string): void
  (e: 'update:includeCodeSnippet', value: boolean): void
  (e: 'applyPreset', preset: { topic: string; notes: string; link: string }): void
  (e: 'randomize'): void
  (e: 'generate'): void
  (e: 'togglePlatform', platform: PlatformId): void
  (e: 'submitPost', payload: { title: string; rawNotes: string; scheduledAt: string; publishNow: boolean; isDraft?: boolean; webLink: string; tags: string[] }): void
  (e: 'selectCategory', category: ContentCategory): void
  (e: 'changeDriveFolder'): void
  (e: 'selectVaultAsset', name: string): void
}>()

const presets = computed(() => [
  { icon: Rocket, label: 'Product update', topic: `${props.brandName} product update`, notes: `Share a specific improvement or result from ${props.brandName}. Explain who benefits and how.`, link: '' },
  { icon: Bot, label: 'Launch', topic: `${props.brandName} launch announcement`, notes: `Describe what ${props.brandName} launched, who it is for, and the next step for interested people.`, link: '' },
  { icon: Cpu, label: 'Customer story', topic: `${props.brandName} customer story`, notes: `Describe a customer problem, the solution, and the outcome. Use verified details only.`, link: '' },
  { icon: Flame, label: 'Weekly recap', topic: `${props.brandName} weekly recap`, notes: `Summarize this week's progress, one useful lesson, and what comes next at ${props.brandName}.`, link: '' }
])
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

    <input :value="topic" class="pub-input" placeholder="Post headline" @input="emit('update:topic', ($event.target as HTMLInputElement).value)" />
    <textarea :value="rawNotes" rows="3" class="pub-textarea" aria-label="Post details" placeholder="Key facts and takeaway" @input="emit('update:rawNotes', ($event.target as HTMLTextAreaElement).value)"></textarea>

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
      <button class="pub-btn" :disabled="loading" @click="emit('generate')"><RefreshCw :size="13" /> Adapt text</button>
    </div>

    <div class="channel-grid">
      <button v-for="platform in availablePlatformIds" :key="platform" class="pub-tab-btn" :class="{ active: selectedPlatforms.includes(platform) }" @click="emit('togglePlatform', platform)">
        <PlatformIcon :platform="platform" :size="13" />
        <span>{{ platformBadges[platform].label.split(' ')[0] }}</span>
        <Check v-if="selectedPlatforms.includes(platform)" :size="11" />
      </button>
    </div>

    <div class="composer-actions">
      <button class="pub-btn" :disabled="loading" title="Save this post as an uncommitted draft" @click="emit('submitPost', { title: topic, rawNotes, scheduledAt: '', publishNow: false, isDraft: true, webLink, tags: tags.split(',').map(tag => tag.trim()) })">
        <Bookmark :size="13" /> Save Draft
      </button>
      <button class="pub-btn" :disabled="loading || selectedPlatforms.length === 0" :title="selectedPlatforms.length ? 'Schedule post for selected channels' : 'Select at least one channel first'" @click="emit('submitPost', { title: topic, rawNotes, scheduledAt, publishNow: false, isDraft: false, webLink, tags: tags.split(',').map(tag => tag.trim()) })">
        <Clock :size="13" /> Schedule
      </button>
      <button class="pub-btn primary" :disabled="loading || !canPublish" :title="canPublish ? 'Publish to configured channels' : 'Configure and select every channel first'" @click="emit('submitPost', { title: topic, rawNotes, scheduledAt, publishNow: true, isDraft: false, webLink, tags: tags.split(',').map(tag => tag.trim()) })">
        <Send :size="13" /> {{ canPublish ? `Publish (${selectedPlatforms.length})` : 'Connect' }}
      </button>
    </div>
  </div>
</template>

<style scoped>
@import './publisher-shared.css';
.composer-form { min-width: 0; }
.channel-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(110px, 1fr)); gap: 7px; }
.channel-grid .pub-tab-btn { min-width: 0; }
.composer-generate-row { justify-content: flex-end; }
.composer-actions { display: grid; grid-template-columns: 1fr 1fr 1.3fr; gap: 8px; margin-top: auto; }
.composer-actions .pub-btn { min-width: 0; width: 100%; white-space: normal; padding: 8px 6px; font-size: 11px; }
@media (max-width: 600px) { .channel-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } .composer-actions { grid-template-columns: 1fr; } }
</style>
