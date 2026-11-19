<script setup lang="ts">
import { ref, computed } from 'vue'
import { Sparkles } from 'lucide-vue-next'
import {
  BRAND_NICHES,
  CURATED_CREATIVE_VIDEOS,
  generateHumanCaptions,
  type CreativeVideoItem
} from '../domain/creative-hub'
import CreativeVideoCard from './creative-hub/CreativeVideoCard.vue'

const props = defineProps<{
  brandHandle?: string
  searchQuery?: string
}>()

const selectedCategory = ref<string>('All Niches')
const copiedCaptionId = ref<string | null>(null)
const categoriesList = ['All Niches', ...BRAND_NICHES]

const filteredVideos = computed(() => {
  const q = (props.searchQuery || '').trim().toLowerCase()
  return CURATED_CREATIVE_VIDEOS.filter(item => {
    const matchCat = selectedCategory.value === 'All Niches' || item.category === selectedCategory.value
    const matchQ = !q ||
      item.title.toLowerCase().includes(q) ||
      item.author.toLowerCase().includes(q)
    return matchCat && matchQ
  })
})

function copyCaption(text: string, id: string) {
  navigator.clipboard.writeText(text)
  copiedCaptionId.value = id
  setTimeout(() => {
    copiedCaptionId.value = null
  }, 2000)
}

function getCaptionsForItem(item: CreativeVideoItem): string[] {
  return generateHumanCaptions(item.category, props.brandHandle)
}
</script>

<template>
  <div class="panel creative-panel">
    <div class="panel-heading">
      <h2><Sparkles :size="16" style="vertical-align: -2px; margin-right: 6px; color: #c084fc;" />Content Studio</h2>
    </div>

    <div class="creative-filter-bar">
      <div class="category-chips">
        <button
          v-for="cat in categoriesList"
          :key="cat"
          class="chip-btn"
          :class="{ 'chip-btn--active': selectedCategory === cat }"
          @click="selectedCategory = cat"
        >
          {{ cat }}
        </button>
      </div>
    </div>

    <div class="creative-grid">
      <CreativeVideoCard
        v-for="video in filteredVideos"
        :key="video.id"
        :video="video"
        :captions="getCaptionsForItem(video)"
        :copied-caption-id="copiedCaptionId"
        @copy="copyCaption"
      />
    </div>
  </div>
</template>

<style scoped lang="scss">
@use './creative-hub/styles/creative-hub-layout.scss';
</style>
