<script setup lang="ts">
import { ref } from 'vue'
import { Sparkles, Cpu } from 'lucide-vue-next'

interface QuboSlot {
  id: string
  day: string
  hour: number
  platform: string
  engagement: number
}

const targetCount = ref(4)
const loading = ref(false)
const slots = ref<QuboSlot[]>([])
const meta = ref<{ energy: number; durationMs: number } | null>(null)
const error = ref('')

async function runOptimizer() {
  loading.value = true
  error.value = ''
  try {
    const res = await fetch('/api/social/optimize-schedule', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ targetCount: targetCount.value, iterations: 400 })
    })
    const data = await res.json()
    if (!res.ok || !data.success) throw new Error(data.error || 'Optimization failed')
    slots.value = data.selectedSlots || []
    meta.value = { energy: data.energy, durationMs: data.durationMs }
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Could not optimize schedule.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <section class="qubo-panel" aria-label="QUBO Weekly Schedule Optimizer">
    <div class="qubo-head">
      <div class="qubo-title">
        <Cpu :size="14" />
        <strong>QUBO Schedule Optimizer</strong>
        <span v-if="meta" class="qubo-meta">E={{ meta.energy }} · {{ meta.durationMs }}ms</span>
      </div>
      <div class="qubo-controls">
        <button v-for="n in [2, 4, 6]" :key="n" type="button" class="cadence-pill" :class="{ active: targetCount === n }" @click="targetCount = n">
          {{ n }}/wk
        </button>
        <button type="button" class="optimize-btn" :disabled="loading" @click="runOptimizer">
          <Sparkles :size="12" /> {{ loading ? 'Solving...' : 'Optimize' }}
        </button>
      </div>
    </div>

    <p v-if="error" class="qubo-err">{{ error }}</p>
    <div v-if="slots.length" class="qubo-grid">
      <div v-for="slot in slots" :key="slot.id" class="slot-chip">
        <strong>{{ slot.day }} {{ String(slot.hour).padStart(2, '0') }}:00</strong>
        <span>{{ slot.platform }}</span>
        <small>{{ Math.round(slot.engagement * 100) }}%</small>
      </div>
    </div>
  </section>
</template>

<style scoped lang="scss">
.qubo-panel { padding: 10px 12px; border: 1px solid var(--line); border-radius: 10px; background: var(--surface-2, rgba(255,255,255,0.03)); display: flex; flex-direction: column; gap: 8px; }
.qubo-head { display: flex; align-items: center; justify-content: space-between; gap: 8px; flex-wrap: wrap; }
.qubo-title { display: inline-flex; align-items: center; gap: 6px; font-size: 12px; }
.qubo-meta { font-size: 10px; color: #10b981; font-family: monospace; }
.qubo-controls { display: inline-flex; align-items: center; gap: 5px; }
.cadence-pill, .optimize-btn {
  border: 1px solid var(--line); background: transparent; color: var(--ink); border-radius: 999px;
  padding: 3px 8px; font-size: 11px; font-weight: 600; cursor: pointer; display: inline-flex; align-items: center; gap: 4px;
}
.cadence-pill.active { border-color: var(--accent, #38bdf8); color: var(--accent, #38bdf8); }
.optimize-btn { background: rgba(56, 189, 248, 0.14); border-color: var(--accent, #38bdf8); }
.qubo-err { font-size: 11px; color: #f87171; margin: 0; }
.qubo-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 6px; }
.slot-chip {
  padding: 6px 8px; border: 1px solid var(--line); border-radius: 7px; font-size: 11px;
  display: flex; flex-direction: column; gap: 2px;
  span { text-transform: uppercase; font-size: 10px; color: var(--accent, #38bdf8); font-weight: 700; }
  small { color: var(--muted); font-size: 10px; }
}
</style>
