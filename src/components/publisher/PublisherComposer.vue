<script setup lang="ts">
import { ref, computed, toRef } from 'vue'
import type { PlatformId } from '../../types'
import PublisherComposerForm from './PublisherComposerForm.vue'
import PublisherVariantReview from './PublisherVariantReview.vue'
import { usePublisherComposerResources } from './composables/usePublisherComposerResources'
import { useRandomPostDraft } from './composables/useRandomPostDraft'

const props = defineProps<{
  brandId: string
  loading: boolean
  brandName: string
  brandTone?: string
  selectedPlatforms: PlatformId[]
  availablePlatformIds: PlatformId[]
  configuredPlatformIds: PlatformId[]
  generatedVariants: Record<PlatformId, string>
  platformBadges: Record<PlatformId, { icon: string; color: string; bg: string; label: string }>
}>()

const canPublish = computed(() =>
  props.selectedPlatforms.length > 0 &&
  props.selectedPlatforms.every(id => props.configuredPlatformIds.includes(id))
)

const emit = defineEmits<{
  (e: 'togglePlatform', id: PlatformId): void
  (e: 'generate', payload: { topic: string; rawNotes: string; tone: string; targetSubreddit: string; tags: string[]; includeCodeSnippet: boolean; webLink?: string; imageUrl?: string; videoUrl?: string }): void
  (e: 'submitPost', payload: { title: string; rawNotes: string; scheduledAt: string; publishNow: boolean; webLink?: string; imageUrl?: string; videoUrl?: string; tags?: string[] }): void
  (e: 'openIntent', id: PlatformId, text?: string): void
  (e: 'updateVariant', id: PlatformId, text: string): void
  (e: 'showToast', msg: string): void
}>()

const brandId = toRef(props, 'brandId')
const topicInput = ref(`${props.brandName} company update`)
const rawNotesInput = ref(`Share a specific update from ${props.brandName} and why it matters.`)
const webLinkInput = ref('')
const imageUrlInput = ref('')
const selectedTone = ref(props.brandTone || 'Clear and authentic')
const targetSubreddit = ref('')
const tagsInput = ref('')
const includeCodeSnippet = ref(true)
const scheduledDateTime = ref(new Date(Date.now() + 3600 * 1000 * 2).toISOString().slice(0, 16))
const activePreviewPlatform = ref<PlatformId>('x')
const previewCover = ref<string | null>(null)
const selectedAsset = ref<string | null>(null)

const {
  drafting: draftingRandomPost, draftId: randomDraftId, feedback: randomDraftFeedback,
  sendingFeedback: sendingRandomFeedback, clearDraft, randomize: randomizeDebate, rate: rateRandomDraft
} = useRandomPostDraft({
  brandId, topic: topicInput, rawNotes: rawNotesInput, webLink: webLinkInput, imageUrl: imageUrlInput,
  previewCover, tags: tagsInput, selectedAsset,
  updateVariant: (platform, text) => emit('updateVariant', platform, text),
  showToast: message => emit('showToast', message)
})

const {
  categories: contentCategories, selectedCategoryId, loadingCategory,
  driveFolder: designatedDriveFolder, assets: vaultAssets,
  selectCategory, changeDriveFolder: promptChangeDriveFolder, selectAsset: selectVaultAsset
} = usePublisherComposerResources({
  brandId, topic: topicInput, rawNotes: rawNotesInput, webLink: webLinkInput, tags: tagsInput,
  imageUrl: imageUrlInput, previewCover, selectedAsset, clearDraft, triggerGenerate,
  updateVariant: (platform, text) => emit('updateVariant', platform, text),
  showToast: message => emit('showToast', message)
})

function triggerGenerate() {
  randomDraftId.value = null
  const tags = tagsInput.value.split(',').map(t => t.trim()).filter(Boolean)
  emit('generate', {
    topic: topicInput.value, rawNotes: rawNotesInput.value, tone: selectedTone.value,
    targetSubreddit: targetSubreddit.value, tags, includeCodeSnippet: includeCodeSnippet.value,
    webLink: webLinkInput.value, imageUrl: imageUrlInput.value || undefined
  })
}

function applyPreset(p: { topic: string; notes: string; link: string }) {
  randomDraftId.value = null
  topicInput.value = p.topic
  rawNotesInput.value = p.notes
  if (p.link) webLinkInput.value = p.link
  triggerGenerate()
}
</script>

<template>
  <div class="pub-grid-2">
    <PublisherComposerForm
      v-model:topic="topicInput" v-model:raw-notes="rawNotesInput" v-model:web-link="webLinkInput"
      v-model:tags="tagsInput" v-model:tone="selectedTone" v-model:subreddit="targetSubreddit"
      v-model:scheduled-at="scheduledDateTime" v-model:include-code-snippet="includeCodeSnippet"
      :brand-name="brandName" :loading="loading" :can-publish="canPublish"
      :selected-platforms="selectedPlatforms" :available-platform-ids="availablePlatformIds"
      :platform-badges="platformBadges" :categories="contentCategories"
      :selected-category-id="selectedCategoryId" :loading-category="loadingCategory"
      :drive-folder="designatedDriveFolder" :assets="vaultAssets"
      :selected-asset="selectedAsset" :drafting-random-post="draftingRandomPost"
      @apply-preset="applyPreset" @randomize="randomizeDebate" @generate="triggerGenerate"
      @toggle-platform="platform => { emit('togglePlatform', platform); activePreviewPlatform = platform }"
      @submit-post="payload => emit('submitPost', payload)" @select-category="selectCategory"
      @change-drive-folder="promptChangeDriveFolder" @select-vault-asset="selectVaultAsset"
    />

    <PublisherVariantReview
      :active-platform="activePreviewPlatform" :selected-platforms="selectedPlatforms" :brand-name="brandName" :topic="topicInput"
      :platform-badges="platformBadges" :generated-variants="generatedVariants"
      :web-link="webLinkInput" :preview-cover="previewCover" :random-draft-id="randomDraftId"
      :drafting-random-post="draftingRandomPost" :random-draft-feedback="randomDraftFeedback"
      :sending-random-feedback="sendingRandomFeedback"
      @update:active-platform="activePreviewPlatform = $event"
      @update-variant="(platform, text) => emit('updateVariant', platform, text)"
      @clear-random-draft-feedback="randomDraftId = null" @rate-random-draft="rateRandomDraft"
      @open-intent="(platform, text) => emit('openIntent', platform, text)"
      @show-toast="msg => emit('showToast', msg)"
    />
  </div>
</template>

<style scoped lang="scss">
@use './styles/publisher-shared.scss';
</style>
