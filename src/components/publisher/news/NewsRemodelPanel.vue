<script setup lang="ts">
import { RefreshCw, Zap } from 'lucide-vue-next'
import type { NewsRemodelOutput } from './types'
import NewsRemodelResults from './NewsRemodelResults.vue'

defineProps<{
  angle: string; framework: string; output: NewsRemodelOutput | null
  remodelling: boolean; copiedKey: string | null
}>()
const emit = defineEmits<{
  (event: 'angleChange', value: string): void
  (event: 'frameworkChange', value: string): void
  (event: 'copy', key: string, text: string): void
  (event: 'useTopic'): void
}>()
const angles = [
  { id: 'contrarian', label: 'Contrarian Debate' }, { id: 'future_of_coding', label: 'Future of Coding' },
  { id: 'benchmark', label: 'Benchmark Check' }, { id: 'ai_commerce', label: 'AI & Agent Buyer' }
]
const frameworks = [
  { id: 'PAS', label: 'PAS (Problem-Agitate-Solve)' }, { id: 'AIDA', label: 'AIDA (Viral Curiosity)' },
  { id: 'BAB', label: 'BAB (Before-After-Bridge)' }, { id: 'HARD_NUMBERS', label: 'Hard Numbers' }
]
</script>

<template>
  <section class="pub-card remodel-panel">
    <header class="pub-row-between">
      <span class="pub-pill purple"><Zap :size="11" />Viral Reformulation Engine</span>
      <div class="framework-selects">
        <select :value="angle" class="pub-select-compact" @change="emit('angleChange', ($event.target as HTMLSelectElement).value)">
          <option v-for="item in angles" :key="item.id" :value="item.id">{{ item.label }}</option>
        </select>
        <select :value="framework" class="pub-select-compact" @change="emit('frameworkChange', ($event.target as HTMLSelectElement).value)">
          <option v-for="item in frameworks" :key="item.id" :value="item.id">{{ item.label }}</option>
        </select>
      </div>
    </header>
    <div v-if="remodelling" class="remodel-loading"><RefreshCw :size="20" class="spin-anim" />
      <span>Synthesizing high-engagement hooks & open-source promo...</span>
    </div>
    <NewsRemodelResults v-else-if="output" :output="output" :copied-key="copiedKey"
      @copy="(key, text) => emit('copy', key, text)" @use-topic="emit('useTopic')" />
  </section>
</template>

<style scoped>
@import '../publisher-shared.css';
.remodel-panel { gap: 10px; }
.framework-selects { display: flex; gap: 6px; }
.pub-select-compact { padding: 4px 8px; border-radius: 6px; font-size: 11px; background: rgba(0,0,0,.4); color: #f1f5f9; border: 1px solid rgba(255,255,255,.15); }
.remodel-loading { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 250px; gap: 12px; color: #94a3b8; font-size: 12px; }
.spin-anim { animation: spin 1s linear infinite; }
@keyframes spin { 100% { transform: rotate(360deg); } }
</style>
