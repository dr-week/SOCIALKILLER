<script setup lang="ts">
import { ref, computed } from 'vue'
import { Megaphone, Copy, Check, TrendingUp, Sparkles, Target, Gauge } from 'lucide-vue-next'
import { generateLyraMarketingSuite, type GeneratedAd } from '../../domain/marketing-intelligence'

const props = defineProps<{ brandName?: string }>()
const emit = defineEmits<{ (e: 'showToast', msg: string): void }>()

const suite = computed(() =>
  generateLyraMarketingSuite({
    projectName: props.brandName || 'Zuari (dr-week/fast-framework)',
    category: 'Zero-VDOM Reactive Web, 120 FPS WebXR & Wasm',
    targetMarket: 'both'
  })
)

const subView = ref<'copy' | 'ads' | 'market'>('copy')
const selectedFwId = ref<'FAST' | 'PAS' | 'AIDA' | 'BAB'>('FAST')
const copiedIndex = ref<number | null>(null)
const copiedFw = ref(false)

const activeFramework = computed(
  () => suite.value.copyFrameworks.find(f => f.id === selectedFwId.value) || suite.value.copyFrameworks[0]
)

const ZUARI_BENCHMARKS = [
  { fw: 'Zuari (@zuari/core)', size: '< 2.5 KB', vdom: '0% (W3C DOM Parts)', webxr: '120 FPS Native', wasm: 'Zero-Copy Float64' },
  { fw: 'React 19 + Three.js', size: '~185 KB', vdom: 'Heavy VDOM Diff', webxr: 'Bridge Overhead', wasm: 'JSON Serialization' },
  { fw: 'Svelte 5', size: '~12 KB', vdom: '0% (Runes)', webxr: 'External Wrapper', wasm: 'Manual Glue' },
  { fw: 'SolidJS', size: '~7.8 KB', vdom: '0% (Fine-Grained)', webxr: 'External Wrapper', wasm: 'Manual Glue' }
]

function copyFrameworkCopy() {
  navigator.clipboard.writeText(activeFramework.value.copy)
  copiedFw.value = true
  emit('showToast', `Copied ${activeFramework.value.id} copywriting!`)
  setTimeout(() => { copiedFw.value = false }, 1800)
}

function copyAdText(ad: GeneratedAd, idx: number) {
  navigator.clipboard.writeText(`${ad.headline}\n\n${ad.description}\nCTA: ${ad.cta}`)
  copiedIndex.value = idx
  emit('showToast', `Copied ${ad.platform} ad!`)
  setTimeout(() => { copiedIndex.value = null }, 1800)
}
</script>

<template>
  <div class="pub-section">
    <div class="pub-hero">
      <div class="pub-hero-left">
        <Megaphone :size="22" style="color: #f59e0b" />
        <div>
          <h3 class="pub-hero-title">Lyra 4-D &amp; FAST Copy, Ads &amp; Market Matrix</h3>
          <p class="pub-hero-sub">Minimal icon-switched workspace for Copywriting, Ad Campaigns &amp; Benchmarks</p>
        </div>
      </div>
      <div class="pub-tabs">
        <button class="pub-tab-btn" :class="{ active: subView === 'copy' }" @click="subView = 'copy'">
          <Sparkles :size="13" /> <span>Lyra / FAST Copy</span>
        </button>
        <button class="pub-tab-btn" :class="{ active: subView === 'ads' }" @click="subView = 'ads'">
          <Target :size="13" /> <span>Ads ({{ suite.ads.length }})</span>
        </button>
        <button class="pub-tab-btn" :class="{ active: subView === 'market' }" @click="subView = 'market'">
          <Gauge :size="13" /> <span>Market &amp; Benchmarks</span>
        </button>
      </div>
    </div>

    <!-- Sub-view 1: Lyra 4-D & FAST Copywriting -->
    <div v-if="subView === 'copy'" class="pub-card">
      <div class="pub-row-between">
        <div class="pub-tabs">
          <button
            v-for="fw in suite.copyFrameworks"
            :key="fw.id"
            class="pub-tab-btn"
            :class="{ active: selectedFwId === fw.id }"
            @click="selectedFwId = fw.id"
          >
            <Sparkles :size="12" />
            <span>{{ fw.id }}</span>
            <span class="pub-pill amber">{{ fw.badge }}</span>
          </button>
        </div>
        <button class="pub-btn primary" @click="copyFrameworkCopy">
          <component :is="copiedFw ? Check : Copy" :size="13" />
          <span>{{ copiedFw ? 'Copied' : 'Copy Copywriting' }}</span>
        </button>
      </div>
      <pre class="pub-code">{{ activeFramework.copy }}</pre>
    </div>

    <!-- Sub-view 2: Ready-to-Deploy Ads -->
    <div v-else-if="subView === 'ads'" class="pub-grid-2">
      <div v-for="(ad, i) in suite.ads" :key="i" class="pub-card">
        <div class="pub-row-between">
          <strong>{{ ad.platform }}</strong>
          <span class="pub-pill amber">{{ ad.budgetRecommendation }}</span>
        </div>
        <div style="font-weight: 700; font-size: 13px; color: #38bdf8">{{ ad.headline }}</div>
        <p style="margin: 0; font-size: 12px; opacity: 0.8">{{ ad.description }}</p>
        <div class="pub-row-between" style="margin-top: auto">
          <span class="pub-pill green">{{ ad.cta }}</span>
          <button class="pub-btn" @click="copyAdText(ad, i)">
            <component :is="copiedIndex === i ? Check : Copy" :size="12" />
            <span>{{ copiedIndex === i ? 'Copied' : 'Copy Ad' }}</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Sub-view 3: Market Analysis & Zuari Benchmark Matrix -->
    <div v-else class="pub-section">
      <div class="pub-grid-3">
        <div v-for="(item, i) in suite.insights" :key="i" class="pub-card">
          <div class="pub-row-between">
            <span class="pub-pill" :class="item.market === 'ai' ? 'green' : item.market === 'human' ? 'blue' : 'purple'">
              {{ item.market.toUpperCase() }}
            </span>
            <span class="pub-pill amber"><TrendingUp :size="11" /> {{ item.demandLevel }}</span>
          </div>
          <strong>{{ item.niche }}</strong>
          <span style="font-size: 11.5px; opacity: 0.75">{{ item.keyPainPoint }}</span>
          <div class="pub-pill green" style="margin-top: auto"><Sparkles :size="11" /> {{ item.suggestedAction }}</div>
        </div>
      </div>

      <div class="pub-card">
        <strong>Zuari (`dr-week/fast-framework`) Competitive Matrix</strong>
        <table class="bench-table">
          <thead>
            <tr><th>Framework</th><th>Bundle</th><th>DOM Engine</th><th>WebXR</th><th>Wasm FFI</th></tr>
          </thead>
          <tbody>
            <tr v-for="row in ZUARI_BENCHMARKS" :key="row.fw">
              <td><strong>{{ row.fw }}</strong></td>
              <td><span class="pub-pill green">{{ row.size }}</span></td>
              <td>{{ row.vdom }}</td>
              <td>{{ row.webxr }}</td>
              <td>{{ row.wasm }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<style scoped>
@import './publisher-shared.css';
.bench-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 11.5px;
}
.bench-table th, .bench-table td {
  padding: 7px 10px;
  text-align: left;
  border-bottom: 1px solid var(--line, rgba(255, 255, 255, 0.08));
}
</style>
