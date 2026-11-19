<script setup lang="ts">
import type { NewsSource } from './news/types'
import { useNewsViral } from './news/useNewsViral'
import NewsFilters from './news/NewsFilters.vue'
import NewsStoryList from './news/NewsStoryList.vue'
import NewsRemodelPanel from './news/NewsRemodelPanel.vue'

const emit = defineEmits<{
  (event: 'useTopic', payload: { title: string; rawNotes: string; variants?: Record<string, string> }): void
  (event: 'showToast', message: string): void
}>()
const news = useNewsViral()

function changeSource(source: NewsSource) {
  news.activeSource.value = source
  void news.loadTrendingNews()
}
function changeAngle(value: string) {
  news.selectedAngle.value = value
  void news.remodelArticle()
}
function changeFramework(value: string) {
  news.selectedFramework.value = value
  void news.remodelArticle()
}
function copyText(key: string, text: string) {
  void navigator.clipboard.writeText(text)
  news.copiedKey.value = key
  emit('showToast', `Copied ${key} post!`)
  setTimeout(() => { news.copiedKey.value = null }, 1800)
}
function sendToComposer() {
  const output = news.remodelledOutput.value
  if (!output) return
  emit('useTopic', {
    title: output.suggestedPostPayload?.title || news.selectedNews.value?.title || 'Trending Dev Post',
    rawNotes: output.suggestedPostPayload?.rawNotes || news.selectedNews.value?.summary || '',
    variants: output.variants || {}
  })
  emit('showToast', 'Pushed remodelled viral post to Composer!')
}
</script>

<template>
  <div class="viral-remode-suite">
    <NewsFilters :active-source="news.activeSource.value" :loading="news.loadingNews.value"
      @source-change="changeSource" @refresh="news.loadTrendingNews" />
    <div class="pub-grid-2">
      <NewsStoryList :items="news.newsList.value" :selected-id="news.selectedNews.value?.id"
        @select="news.selectNewsItem" />
      <NewsRemodelPanel :angle="news.selectedAngle.value" :framework="news.selectedFramework.value"
        :output="news.remodelledOutput.value" :remodelling="news.remodelling.value" :copied-key="news.copiedKey.value"
        @angle-change="changeAngle" @framework-change="changeFramework"
        @copy="copyText" @use-topic="sendToComposer" />
    </div>
  </div>
</template>

<style scoped>
@import './publisher-shared.css';
.viral-remode-suite { display: flex; flex-direction: column; gap: 12px; }
</style>
