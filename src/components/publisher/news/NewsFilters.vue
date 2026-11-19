<script setup lang="ts">
import { Globe, RefreshCw } from 'lucide-vue-next'
import PlatformIcon from '../../common/PlatformIcon.vue'
import type { NewsSource } from './types'

defineProps<{ activeSource: NewsSource; loading: boolean }>()
const emit = defineEmits<{ (event: 'sourceChange', source: NewsSource): void; (event: 'refresh'): void }>()
const sources: Array<{ id: NewsSource; label: string }> = [
  { id: 'all', label: 'All Trends' }, { id: 'hn', label: 'Hacker News' },
  { id: 'lobsters', label: 'Lobste.rs' }, { id: 'devto', label: 'Dev.to' }
]
</script>

<template>
  <div class="pub-card filter-bar">
    <div class="source-pills">
      <button v-for="source in sources" :key="source.id" class="pub-tab-btn"
        :class="{ active: activeSource === source.id }" @click="emit('sourceChange', source.id)">
        <PlatformIcon v-if="source.id === 'devto'" platform="devto" :size="12" />
        <Globe v-else :size="12" />
        <span>{{ source.label }}</span>
      </button>
    </div>
    <button class="pub-btn" :disabled="loading" @click="emit('refresh')">
      <RefreshCw :size="13" :class="{ 'spin-anim': loading }" />
      <span>Harvest Fresh Leads</span>
    </button>
  </div>
</template>

<style scoped>
@import '../publisher-shared.css';
.filter-bar { flex-direction: row; justify-content: space-between; align-items: center; gap: 10px; }
.source-pills { display: flex; gap: 6px; flex-wrap: wrap; }
.spin-anim { animation: spin 1s linear infinite; }
@keyframes spin { 100% { transform: rotate(360deg); } }
</style>
