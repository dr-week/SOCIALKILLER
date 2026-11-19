<script setup lang="ts">
import { computed } from 'vue'
import type { VaultAsset } from './publisher-types'

const props = defineProps<{
  driveFolder: string
  assets: VaultAsset[]
  selectedAsset: string | null
}>()

const emit = defineEmits<{
  (e: 'change-folder'): void
  (e: 'select-asset', name: string): void
}>()

const folderLabel = computed(() => {
  const parts = props.driveFolder.replace(/[\\/]+$/, '').split(/[\\/]+/).filter(Boolean)
  return parts[parts.length - 1] || 'Default folder'
})

function selectAsset(event: Event) {
  const selectedName = (event.target as HTMLSelectElement).value
  if (selectedName) {
    emit('select-asset', selectedName)
  } else if (props.selectedAsset) {
    emit('select-asset', props.selectedAsset)
  }
}
</script>

<template>
  <section class="media-picker" aria-label="Media">
    <div class="media-folder">
      <span class="media-label">Media</span>
      <span class="folder-name" :title="driveFolder || '.data/media'">{{ folderLabel }}</span>
      <button type="button" class="pub-btn" @click="emit('change-folder')">Folder</button>
    </div>
    <select
      class="pub-select"
      aria-label="Select media"
      :value="selectedAsset || ''"
      :disabled="assets.length === 0"
      @change="selectAsset"
    >
      <option value="">{{ assets.length ? 'No media selected' : 'No media files' }}</option>
      <option v-for="asset in assets" :key="asset.name" :value="asset.name">
        {{ asset.name }}
      </option>
    </select>
  </section>
</template>

<style scoped lang="scss">
@use './styles/publisher-shared.scss';

.media-picker { display: grid; gap: 6px; min-width: 0; }
.media-folder { display: flex; min-width: 0; align-items: center; gap: 8px; }
.media-label { color: var(--muted, #94a3b8); font-size: 11px; font-weight: 600; }
.folder-name { min-width: 0; flex: 1; overflow: hidden; color: var(--muted, #94a3b8); font-size: 10px; text-overflow: ellipsis; white-space: nowrap; }
.media-folder .pub-btn { flex: 0 0 auto; }
</style>
