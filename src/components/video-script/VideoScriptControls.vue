<script setup lang="ts">
import { ref } from 'vue'
import { Sparkles, Clapperboard, Clock, Flame, ShieldAlert, Zap, MapPin } from 'lucide-vue-next'
import type { BrandProfile, ScriptFormat, ScriptPillar } from '../../types/brand'

defineProps<{ activeBrand: BrandProfile; generating: boolean }>()
const emit = defineEmits<{ (event: 'generate', payload: { topic: string; pillar: ScriptPillar; format: ScriptFormat }): void }>()
const topicInput = ref('')
const selectedPillar = ref<ScriptPillar>('daily_grind')
const selectedFormat = ref<ScriptFormat>('short_form_60s')
const PILLARS: Array<{ id: ScriptPillar; label: string; icon: any; desc: string }> = [
  { id: 'daily_grind', label: 'Daily Grind', icon: Clock, desc: '14h days, discipline, coding through power cuts' },
  { id: 'family_doubts', label: 'Family Doubts', icon: ShieldAlert, desc: 'Explaining startup life vs stable IT packages' },
  { id: 'underdog_location', label: 'Goa Underdog', icon: Flame, desc: 'Building global infra outside Bangalore/SF' },
  { id: 'technical_breakthrough', label: 'Tech Deep Dive', icon: Zap, desc: 'Zero-overhead architecture & benchmark breakthroughs' }
]
function triggerGenerate() { emit('generate', { topic: topicInput.value, pillar: selectedPillar.value, format: selectedFormat.value }) }
</script>

<template>
    <!-- Generator Controls -->
    <div class="studio-controls-card">
      <div class="card-head">
        <div class="head-title">
          <Clapperboard :size="16" class="text-purple" />
          <h4>AI Video Script Partner: {{ activeBrand.name }}</h4>
        </div>
        <span class="location-badge" style="display: inline-flex; align-items: center; gap: 4px;">
          <MapPin :size="11" />
          <span>{{ activeBrand.location }} Storytelling Arc</span>
        </span>
      </div>

      <!-- Pillar Selector -->
      <div class="pillar-grid">
        <button
          v-for="p in PILLARS"
          :key="p.id"
          class="pillar-btn"
          :class="{ active: selectedPillar === p.id }"
          @click="selectedPillar = p.id"
        >
          <component :is="p.icon" :size="13" />
          <div class="pillar-text">
            <strong>{{ p.label }}</strong>
            <small>{{ p.desc }}</small>
          </div>
        </button>
      </div>

      <!-- Input row -->
      <div class="studio-input-row">
        <input
          v-model="topicInput"
          type="text"
          class="topic-input"
          :placeholder="`Specific milestone or topic (e.g. ${activeBrand.purpose.what.slice(0, 35)}...)`"
        />

        <select v-model="selectedFormat" class="format-select">
          <option value="short_form_60s">60s Reel / Short</option>
          <option value="short_form_30s">30s Quick Hook</option>
          <option value="vlog_long_form">Daily Vlog Script</option>
        </select>

        <button
          class="generate-btn"
          @click="triggerGenerate"
          :disabled="generating"
        >
          <Sparkles :size="13" />
          <span>{{ generating ? 'Synthesizing...' : 'Generate Script' }}</span>
        </button>
      </div>
    </div>

</template>
