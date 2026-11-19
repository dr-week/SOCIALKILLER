<script setup lang="ts">
import type { ContentCategory } from './publisher-types'

const props = defineProps<{
  categories: ContentCategory[]
  selectedCategoryId: string | null
  loading: boolean
}>()

const emit = defineEmits<{
  (e: 'select', category: ContentCategory): void
}>()

function selectCategory(event: Event) {
  const selectedId = (event.target as HTMLSelectElement).value
  const category = props.categories.find(item => item.id === selectedId)
  if (category) emit('select', category)
}
</script>

<template>
  <label class="category-picker">
    <span>Content pillar</span>
    <select
      class="pub-select"
      aria-label="Content pillar"
      :value="selectedCategoryId || ''"
      :disabled="loading"
      @change="selectCategory"
    >
      <option value="" disabled>Choose a pillar</option>
      <option v-for="category in categories" :key="category.id" :value="category.id">
        {{ category.name }}
      </option>
    </select>
  </label>
</template>

<style scoped lang="scss">
@use './styles/publisher-shared.scss';

.category-picker { display: grid; gap: 5px; color: var(--muted, #94a3b8); font-size: 11px; }
</style>
