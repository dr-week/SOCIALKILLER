<script setup lang="ts">
import { ExternalLink, Star, TrendingUp } from 'lucide-vue-next'
import type { TrendingNewsItem } from './types'

defineProps<{ items: TrendingNewsItem[]; selectedId?: string }>()
const emit = defineEmits<{ (event: 'select', item: TrendingNewsItem): void }>()
</script>

<template>
  <section class="pub-card story-list-card">
    <header class="pub-row-between">
      <span class="pub-pill blue"><TrendingUp :size="11" />Live Extracted Leads ({{ items.length }})</span>
      <span class="text-xs text-muted">Click to re-modify into viral post</span>
    </header>
    <div class="news-scroll-list">
      <article v-for="item in items" :key="item.id" class="news-item"
        :class="{ active: selectedId === item.id }" @click="emit('select', item)">
        <div class="news-item-top">
          <span class="source-tag" :class="item.sourceId">{{ item.sourceId.toUpperCase() }}</span>
          <span class="score-tag"><Star :size="10" />{{ item.metrics?.score || 50 }}</span>
          <a :href="item.url" target="_blank" rel="noopener noreferrer" class="external-link"
            @click.stop title="Open original article"><ExternalLink :size="11" /></a>
        </div>
        <div class="news-title">{{ item.title }}</div>
        <div class="news-summary">{{ item.summary }}</div>
      </article>
    </div>
  </section>
</template>

<style scoped>
@import '../publisher-shared.css';
.story-list-card { gap: 8px; }
.news-scroll-list { display: flex; flex-direction: column; gap: 8px; max-height: 480px; overflow-y: auto; padding-right: 4px; }
.news-item { padding: 10px 12px; border-radius: 8px; background: rgba(255,255,255,.03); border: 1px solid rgba(255,255,255,.06); cursor: pointer; transition: all .15s ease; }
.news-item:hover { background: rgba(255,255,255,.06); border-color: rgba(56,189,248,.3); }
.news-item.active { background: rgba(56,189,248,.09); border-color: #38bdf8; }
.news-item-top { display: flex; align-items: center; gap: 8px; margin-bottom: 4px; }
.source-tag { font-size: 10px; font-weight: 700; padding: 2px 6px; border-radius: 4px; background: rgba(255,255,255,.1); }
.source-tag.hn { background: rgba(255,102,0,.18); color: #ff6600; }
.source-tag.lobsters { background: rgba(225,48,108,.18); color: #e1306c; }
.source-tag.devto { background: rgba(16,185,129,.18); color: #10b981; }
.score-tag { display: inline-flex; align-items: center; gap: 3px; font-size: 11px; color: #fbbf24; }
.external-link { margin-left: auto; color: #94a3b8; }
.external-link:hover { color: #38bdf8; }
.news-title { font-size: 13px; font-weight: 600; color: #f1f5f9; line-height: 1.35; }
.news-summary { font-size: 11px; color: #94a3b8; margin-top: 4px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
</style>
