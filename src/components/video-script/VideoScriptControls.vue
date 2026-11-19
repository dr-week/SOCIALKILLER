<script setup lang="ts">
import { ref } from 'vue'
import { Sparkles, Clock, Flame, ShieldAlert, Zap, MapPin, Minimize2 } from 'lucide-vue-next'
import { summarizeCreativeText } from '../../domain/text-summarizer'
import type { BrandProfile, ScriptFormat, ScriptPillar } from '../../types/brand'

defineProps<{ activeBrand: BrandProfile; generating: boolean }>()
const emit = defineEmits<{ (event: 'generate', payload: { topic: string; pillar: ScriptPillar; format: ScriptFormat }): void }>()
const topicInput = ref('')
const selectedPillar = ref<ScriptPillar>('daily_grind')
const selectedFormat = ref<ScriptFormat>('short_form_60s')
const PILLARS: Array<{ id: ScriptPillar; label: string; icon: any; desc: string }> = [
  { id: 'daily_grind', label: 'Daily Build', icon: Clock, desc: 'Behind-the-scenes process & shipping habits' },
  { id: 'family_doubts', label: 'Founder POV', icon: ShieldAlert, desc: 'Candid trade-offs & lessons from building' },
  { id: 'underdog_location', label: 'Indie Edge', icon: Flame, desc: 'Operating lean & punching above agency weight' },
  { id: 'technical_breakthrough', label: 'Tech Deep Dive', icon: Zap, desc: 'Architecture wins, benchmarks & workflows' }
]
function condenseTopic() {
  if (!topicInput.value.trim()) return
  const summary = summarizeCreativeText(topicInput.value, 2)
  if (summary.tldr) topicInput.value = summary.tldr.slice(0, 120)
}
function triggerGenerate() { emit('generate', { topic: topicInput.value, pillar: selectedPillar.value, format: selectedFormat.value }) }
</script>

<template>
    <div class="studio-controls-card">
      <div class="card-head">
        <span class="location-badge"><MapPin :size="11" /><span>{{ activeBrand.name }} · {{ activeBrand.location }}</span></span>
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
          v-if="topicInput.length > 80"
          type="button"
          class="pillar-btn"
          style="padding: 0 12px; min-height: 40px;"
          title="Condense pasted notes into a sharp video hook"
          @click="condenseTopic"
        >
          <Minimize2 :size="13" />
          <span>TL;DR Hook</span>
        </button>

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
