<script setup lang="ts">
import { ExternalLink, Layers, RefreshCw, Search, ShieldAlert, Sparkles, TrendingUp } from 'lucide-vue-next'
import type { BrandResearch } from '../../types/brand'

defineProps<{ research?: BrandResearch; researching: boolean }>()
const emit = defineEmits<{ (event: 'run'): void }>()
</script>

<template>
  <section class="section-card">
    <div class="section-title space-between">
      <div class="title-left"><Search :size="15" class="text-purple" /><strong>Autonomous Market &amp; Competitor Intelligence</strong></div>
      <button class="pub-btn sm" :disabled="researching" @click="emit('run')">
        <RefreshCw :size="12" :class="{ 'spin-anim': researching }" />
        <span>{{ research ? 'Re-scan Live Competitors' : 'Run Autonomous Research' }}</span>
      </button>
    </div>
    <p class="section-subtext">Automatically crawls live developer news, competitor repositories, and industry debates matching this company's profile description.</p>

    <div v-if="research" class="research-container">
      <div class="research-summary-pill">
        <Sparkles :size="13" class="text-yellow" />
        <span>{{ research.summary }}</span>
        <span class="research-time">Synced {{ new Date(research.researchedAt).toLocaleTimeString() }}</span>
      </div>

      <div v-if="research.competitors?.length" class="research-subgroup">
        <div class="subgroup-title"><Layers :size="13" /><span>Identified Competitors &amp; Ecosystem Projects ({{ research.competitors.length }})</span></div>
        <div class="competitor-cards">
          <div v-for="comp in research.competitors" :key="comp.name" class="comp-card">
            <div class="comp-header">
              <a :href="comp.url" target="_blank" rel="noopener noreferrer" class="comp-title"><strong>{{ comp.name }}</strong><ExternalLink :size="10" /></a>
              <span v-if="comp.stars" class="repo-stars">★ {{ comp.stars }}</span>
              <span v-if="comp.language" class="repo-lang">{{ comp.language }}</span>
            </div>
            <p class="comp-desc">{{ comp.description || 'No description available' }}</p>
          </div>
        </div>
      </div>

      <div v-if="research.trendingDebates?.length" class="research-subgroup">
        <div class="subgroup-title"><TrendingUp :size="13" class="text-green" /><span>Active Market Debates &amp; News Signals ({{ research.trendingDebates.length }})</span></div>
        <div class="debates-list">
          <div v-for="(debate, idx) in research.trendingDebates" :key="idx" class="debate-item">
            <span class="source-tag">{{ debate.source }}</span>
            <a :href="debate.url" target="_blank" rel="noopener noreferrer" class="debate-title">{{ debate.title }}</a>
            <span class="metric-tag">{{ debate.metric }}</span>
          </div>
        </div>
      </div>

      <div v-if="research.competitorAngles?.length" class="research-subgroup">
        <div class="subgroup-title"><ShieldAlert :size="13" class="text-orange" /><span>Positioning &amp; Competitor Differentiator Angles</span></div>
        <div class="angles-list">
          <div v-for="(angle, idx) in research.competitorAngles" :key="idx" class="angle-item"><strong>{{ angle.topic }}</strong><p>{{ angle.angle }}</p></div>
        </div>
      </div>
    </div>
    <div v-else class="research-empty">No market research stored yet. Click "Run Autonomous Research" to query Hacker News, GitHub, and Dev.to for competitors and market trends.</div>
  </section>
</template>

<style scoped lang="scss">
.section-card { background:#181d2a; border:1px solid rgba(255,255,255,.06); border-radius:8px; padding:12px; display:flex; flex-direction:column; gap:10px; }
.section-title.space-between { display:flex; align-items:center; justify-content:space-between; width:100%; gap:8px; font-size:12px; color:#cbd5e1; }
.title-left,.subgroup-title { display:flex; align-items:center; gap:6px; }
.section-subtext { margin:0; font-size:11px; color:#64748b; line-height:1.4; }
.pub-btn { background:rgba(255,255,255,.08); border:1px solid rgba(255,255,255,.12); color:#e2e8f0; border-radius:6px; padding:4px 8px; font-size:10px; font-weight:600; cursor:pointer; display:inline-flex; align-items:center; gap:5px; }
.pub-btn:disabled { opacity:.5; cursor:not-allowed; }
.research-container,.research-subgroup,.debates-list,.angles-list { display:flex; flex-direction:column; gap:8px; }
.research-summary-pill { background:rgba(250,204,21,.08); border:1px solid rgba(250,204,21,.2); border-radius:6px; padding:6px 10px; display:flex; align-items:center; gap:8px; font-size:11px; color:#fef08a; }
.research-time { margin-left:auto; font-size:10px; color:#94a3b8; }
.subgroup-title { font-size:11px; font-weight:600; color:#94a3b8; }
.competitor-cards { display:grid; grid-template-columns:repeat(auto-fill,minmax(260px,1fr)); gap:8px; }
.comp-card { background:rgba(0,0,0,.25); border:1px solid rgba(255,255,255,.06); border-radius:6px; padding:8px; display:flex; flex-direction:column; gap:4px; }
.comp-header { display:flex; align-items:center; gap:6px; }
.comp-title { color:#38bdf8; text-decoration:none; font-size:11px; display:inline-flex; align-items:center; gap:3px; }
.comp-title:hover,.debate-title:hover { text-decoration:underline; }
.repo-stars { color:#f59e0b; font-size:10px; }
.repo-lang { margin-left:auto; font-size:10px; color:#94a3b8; background:rgba(255,255,255,.05); padding:1px 4px; border-radius:3px; }
.comp-desc { margin:0; font-size:10px; color:#94a3b8; line-height:1.3; }
.debate-item { display:flex; align-items:center; gap:6px; background:rgba(0,0,0,.2); border:1px solid rgba(255,255,255,.05); border-radius:4px; padding:4px 8px; font-size:11px; }
.source-tag { background:rgba(99,102,241,.15); color:#818cf8; font-size:9px; font-weight:700; padding:1px 4px; border-radius:3px; }
.debate-title { color:#e2e8f0; text-decoration:none; flex:1; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.metric-tag { font-size:10px; color:#64748b; }
.angle-item { background:rgba(251,146,60,.06); border-left:3px solid #fb923c; padding:6px 10px; border-radius:0 4px 4px 0; display:flex; flex-direction:column; gap:2px; }
.angle-item strong { font-size:11px; color:#fed7aa; }.angle-item p { margin:0; font-size:10px; color:#cbd5e1; line-height:1.35; }
.research-empty { font-size:11px; color:#64748b; font-style:italic; padding:4px 0; }
.text-purple { color:#a855f7; }.text-green { color:#10b981; }.text-yellow { color:#facc15; }.text-orange { color:#fb923c; }
.spin-anim { animation:spin 1s linear infinite; }@keyframes spin { from { transform:rotate(0deg); } to { transform:rotate(360deg); } }
@media (max-width:560px) { .section-title.space-between { align-items:flex-start; flex-direction:column; } }
</style>
