<script setup lang="ts">
import { CheckCircle2, ExternalLink, Github, RefreshCw } from 'lucide-vue-next'
import type { BrandRepo } from '../../types/brand'

defineProps<{
  githubUser: string
  repos: BrandRepo[]
  syncing: boolean
  syncedAt?: string
}>()

const emit = defineEmits<{
  (e: 'update:githubUser', value: string): void
  (e: 'sync'): void
}>()
</script>

<template>
  <div class="section-card">
    <div class="section-title">
      <Github :size="15" />
      <strong>GitHub Organization / Developer Account</strong>
    </div>
    <div class="github-sync-row">
      <input
        :value="githubUser"
        type="text"
        class="pub-input"
        placeholder="e.g. dr-week or https://github.com/dr-week"
        @input="emit('update:githubUser', ($event.target as HTMLInputElement).value)"
      />
      <button class="pub-btn" :disabled="syncing || !githubUser.trim()" @click="emit('sync')">
        <RefreshCw :size="13" :class="{ 'spin-anim': syncing }" />
        <span>Fetch Repos</span>
      </button>
    </div>
    <div v-if="syncedAt" class="sync-status">
      <CheckCircle2 :size="12" class="text-green" />
      <span>{{ repos.length }} public repos indexed</span>
    </div>
    <div v-if="repos.length" class="repos-grid">
      <div v-for="repo in repos" :key="repo.name" class="repo-chip">
        <div class="repo-top">
          <a :href="repo.url" target="_blank" rel="noopener noreferrer" class="repo-name">
            <strong>{{ repo.name }}</strong>
            <ExternalLink :size="10" />
          </a>
          <span v-if="repo.stars" class="repo-stars">★ {{ repo.stars }}</span>
          <span v-if="repo.language" class="repo-lang">{{ repo.language }}</span>
        </div>
        <p class="repo-desc">{{ repo.description || 'No description provided' }}</p>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.section-card { display: flex; flex-direction: column; gap: 10px; padding: 13px; border: 1px solid var(--glass-border, rgba(255, 255, 255, 0.08)); border-radius: 12px; background: var(--surface-raised, rgba(255, 255, 255, 0.03)); }
.section-title { display: flex; align-items: center; gap: 6px; font-size: 12px; color: var(--ink, #cbd5e1); }
.github-sync-row { display: flex; gap: 8px; align-items: center; }
.pub-input { flex: 1; background: var(--input-bg, #0f121a); border: 1px solid var(--line, rgba(255, 255, 255, 0.12)); border-radius: 8px; padding: 7px 10px; color: var(--ink, #fff); font-size: 12px; }
.pub-btn { display: inline-flex; align-items: center; gap: 5px; padding: 7px 12px; border: 1px solid var(--line, rgba(255, 255, 255, 0.14)); border-radius: 8px; background: var(--surface-raised); color: var(--ink, #e2e8f0); font-size: 11px; font-weight: 600; cursor: pointer; }
.pub-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.sync-status { display: flex; align-items: center; gap: 6px; font-size: 11px; color: #10b981; }
.repos-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 8px; max-height: 200px; overflow-y: auto; }
.repo-chip { background: rgba(255, 255, 255, 0.03); border: 1px solid var(--line, rgba(255, 255, 255, 0.06)); border-radius: 8px; padding: 8px; }
.repo-top { display: flex; align-items: center; gap: 6px; font-size: 11px; }
.repo-name { color: #38bdf8; text-decoration: none; display: inline-flex; align-items: center; gap: 3px; }
.repo-stars { color: #f59e0b; font-size: 10px; }
.repo-lang { margin-left: auto; font-size: 10px; color: var(--muted, #94a3b8); background: rgba(255, 255, 255, 0.05); padding: 1px 4px; border-radius: 3px; }
.repo-desc { margin: 4px 0 0; font-size: 10px; color: var(--muted, #94a3b8); line-height: 1.3; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.spin-anim { animation: spin 1s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
</style>
