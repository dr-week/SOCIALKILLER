<script setup lang="ts">
import { Sparkles, Download, Copy, Check, Play, ExternalLink, Heart, Rocket } from 'lucide-vue-next'
import type { CreativeVideoItem } from '../../domain/creative-hub'
import { predictViralReach } from '../../domain/analytics/viral-predictor'

defineProps<{
  video: CreativeVideoItem
  captions: string[]
  copiedCaptionId: string | null
}>()

const emit = defineEmits<{
  (e: 'copy', text: string, id: string): void
}>()
</script>

<template>
  <div class="creative-card">
    <div class="video-preview-wrap">
      <img :src="video.thumbnail" :alt="video.title" class="video-thumb" />
      <div class="video-duration">{{ video.duration }}</div>
      <div class="video-author-tag">@{{ video.author }}</div>
      <a :href="video.videoUrl" target="_blank" class="play-overlay" title="Preview clip">
        <Play :size="24" fill="currentColor" />
      </a>
    </div>

    <div class="creative-card-body">
      <div class="card-meta">
        <span class="category-pill">{{ video.category }}</span>
        <span class="likes-count" style="display: inline-flex; align-items: center; gap: 3px;">
          <Heart :size="11" fill="currentColor" />
          <span>{{ video.likes }}</span>
        </span>
      </div>
      <h3 class="video-title">{{ video.title }}</h3>

      <div class="card-actions-row">
        <a
          :href="`/api/instagram/download-proxy?url=${encodeURIComponent(video.thumbnail)}&filename=${encodeURIComponent(video.id)}.jpg`"
          target="_blank"
          class="button button--primary button--tiny download-btn"
          :download="`${video.id}-media.jpg`"
        >
          <Download :size="13" />
          <span>Download Media</span>
        </a>
        <a
          :href="`https://www.instagram.com/${encodeURIComponent(video.author)}/`"
          target="_blank"
          class="button button--outline button--tiny"
          title="Open author on Instagram"
        >
          <ExternalLink :size="12" />
        </a>
      </div>

      <div class="captions-section">
        <div class="captions-header">
          <span class="captions-label">
            <Sparkles :size="12" /> Authentic Human Captions (Ready to post)
          </span>
        </div>

        <div class="captions-list">
          <div v-for="(cap, cIdx) in captions" :key="cIdx" class="caption-card">
            <div style="flex: 1;">
              <p class="caption-text">"{{ cap }}"</p>
              <div style="display: flex; align-items: center; gap: 6px; margin-top: 6px; flex-wrap: wrap;">
                <span style="font-size: 10px; font-weight: 700; padding: 1px 6px; border-radius: 999px; background: rgba(16, 185, 129, 0.12); color: #10b981; border: 1px solid rgba(16, 185, 129, 0.25); display: inline-flex; align-items: center; gap: 3px;">
                  <Rocket :size="10" />
                  <span>Viral Score: {{ predictViralReach(cap).overallScore }}%</span>
                </span>
                <span style="font-size: 10px; font-weight: 600; padding: 1px 6px; border-radius: 999px; background: rgba(59, 130, 246, 0.1); color: #60a5fa; display: inline-flex; align-items: center; gap: 3px;">
                  <Sparkles :size="10" />
                  <span>Hook: {{ predictViralReach(cap).hookScore }}%</span>
                </span>
                <span style="font-size: 10px; padding: 1px 6px; border-radius: 999px; background: rgba(255, 255, 255, 0.05); color: #94a3b8;">
                  {{ predictViralReach(cap).sentimentTone }}
                </span>
              </div>
            </div>
            <button
              class="copy-caption-btn"
              :class="{ 'copied': copiedCaptionId === `${video.id}-${cIdx}` }"
              @click="emit('copy', cap, `${video.id}-${cIdx}`)"
              title="Copy caption to clipboard"
            >
              <component :is="copiedCaptionId === `${video.id}-${cIdx}` ? Check : Copy" :size="12" />
              <span>{{ copiedCaptionId === `${video.id}-${cIdx}` ? 'Copied!' : 'Copy' }}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use './styles/creative-hub-card.scss';
</style>
