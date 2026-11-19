<script setup lang="ts">
import type { ContentCategory, VaultAsset } from './publisher-types'
import PublisherCategoryPicker from './PublisherCategoryPicker.vue'
import PublisherContentOptions from './PublisherContentOptions.vue'
import PublisherMediaPicker from './PublisherMediaPicker.vue'

const props = defineProps<{
  categories: ContentCategory[]
  selectedCategoryId: string | null
  loadingCategory: boolean
  driveFolder: string
  assets: VaultAsset[]
  selectedAsset: string | null
  webLink: string
  tags: string
  tone: string
  subreddit: string
  scheduledAt: string
  includeCodeSnippet: boolean
}>()

const emit = defineEmits<{
  (e: 'select-category', category: ContentCategory): void
  (e: 'change-drive-folder'): void
  (e: 'select-vault-asset', name: string): void
  (e: 'update:webLink', value: string): void
  (e: 'update:tags', value: string): void
  (e: 'update:tone', value: string): void
  (e: 'update:subreddit', value: string): void
  (e: 'update:scheduledAt', value: string): void
  (e: 'update:includeCodeSnippet', value: boolean): void
}>()
</script>

<template>
  <details class="advanced-options">
    <summary>More options</summary>
    <div class="options-content">
      <PublisherCategoryPicker
        v-if="categories.length"
        :categories="categories"
        :selected-category-id="selectedCategoryId"
        :loading="loadingCategory"
        @select="emit('select-category', $event)"
      />
      <PublisherMediaPicker
        :drive-folder="driveFolder"
        :assets="assets"
        :selected-asset="selectedAsset"
        @change-folder="emit('change-drive-folder')"
        @select-asset="emit('select-vault-asset', $event)"
      />
      <PublisherContentOptions
        :web-link="webLink"
        :tags="tags"
        :tone="tone"
        :subreddit="subreddit"
        :scheduled-at="scheduledAt"
        :include-code-snippet="includeCodeSnippet"
        @update:web-link="emit('update:webLink', $event)"
        @update:tags="emit('update:tags', $event)"
        @update:tone="emit('update:tone', $event)"
        @update:subreddit="emit('update:subreddit', $event)"
        @update:scheduled-at="emit('update:scheduledAt', $event)"
        @update:include-code-snippet="emit('update:includeCodeSnippet', $event)"
      />
    </div>
  </details>
</template>

<style scoped>
.advanced-options {
  min-width: 0;
  border: 1px solid var(--glass-border, rgba(255, 255, 255, 0.12));
  border-radius: 12px;
  background: var(--glass-bg, rgba(255, 255, 255, 0.03));
  backdrop-filter: blur(14px);
}

summary {
  display: flex;
  min-height: 42px;
  align-items: center;
  padding: 8px 11px;
  color: var(--ink, #fff);
  cursor: pointer;
  font-size: 12px;
  font-weight: 650;
  list-style: none;
}

summary::-webkit-details-marker { display: none; }
summary::after { margin-left: auto; color: var(--muted, #94a3b8); content: '+'; font-size: 18px; font-weight: 400; }
.advanced-options[open] > summary::after { content: '−'; }
.options-content { display: grid; gap: 10px; padding: 0 10px 10px; }
</style>
