<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  Sparkles,
  Download,
  Copy,
  Check,
  Play,
  Film,
  ExternalLink,
  RefreshCw,
  SlidersHorizontal,
  Bookmark,
  Heart,
  Rocket
} from 'lucide-vue-next'
import {
  BRAND_NICHES,
  CURATED_CREATIVE_VIDEOS,
  generateHumanCaptions,
  type CreativeVideoItem
} from '../domain/creative-hub'
import { predictViralReach, type ViralPrediction } from '../domain/analytics/viral-predictor'

const props = defineProps<{
  brandHandle?: string
}>()

const selectedCategory = ref<string>('All Niches')
const copiedCaptionId = ref<string | null>(null)
const activePreviewVideo = ref<CreativeVideoItem | null>(null)
const customSearch = ref('')

const categoriesList = ['All Niches', ...BRAND_NICHES]

const filteredVideos = computed(() => {
  return CURATED_CREATIVE_VIDEOS.filter(item => {
    const matchCat = selectedCategory.value === 'All Niches' || item.category === selectedCategory.value
    const matchQ = customSearch.value.trim() === '' ||
      item.title.toLowerCase().includes(customSearch.value.toLowerCase()) ||
      item.author.toLowerCase().includes(customSearch.value.toLowerCase())
    return matchCat && matchQ
  })
})

function copyCaption(text: string, id: string) {
  navigator.clipboard.writeText(text)
  copiedCaptionId.value = id
  setTimeout(() => {
    copiedCaptionId.value = null
  }, 2000)
}

function getCaptionsForItem(item: CreativeVideoItem): string[] {
  return generateHumanCaptions(item.category, props.brandHandle)
}
</script>

<template>
  <div class="panel creative-panel">
    <!-- Header -->
    <div class="panel-heading">
      <div>
        <div style="display: flex; align-items: center; gap: 8px;">
          <span class="section-kicker">CONTENT STUDIO</span>
          <span class="badge badge--creative">
            <Sparkles :size="11" /> Creative Repost Hub
          </span>
        </div>
        <h2>Creative Video Curation & Human Captions</h2>
        <p class="panel-subtext">
          Discover high-performing aesthetic and viral clips suited for your brand, download in HD, and copy authentic human captions ready to repost.
        </p>
      </div>
    </div>

    <!-- Category Filter Bar -->
    <div class="creative-filter-bar">
      <div class="category-chips">
        <button
          v-for="cat in categoriesList"
          :key="cat"
          class="chip-btn"
          :class="{ 'chip-btn--active': selectedCategory === cat }"
          @click="selectedCategory = cat"
        >
          {{ cat }}
        </button>
      </div>

      <div class="creative-search-wrap">
        <input
          v-model="customSearch"
          type="text"
          placeholder="Filter by keyword or creator..."
          class="creative-search-input"
        />
      </div>
    </div>

    <!-- Video Cards Grid -->
    <div class="creative-grid">
      <div
        v-for="video in filteredVideos"
        :key="video.id"
        class="creative-card"
      >
        <!-- Video Thumbnail & Play Preview -->
        <div class="video-preview-wrap">
          <img :src="video.thumbnail" :alt="video.title" class="video-thumb" />
          <div class="video-duration">{{ video.duration }}</div>
          <div class="video-author-tag">@{{ video.author }}</div>
          <a
            :href="video.videoUrl"
            target="_blank"
            class="play-overlay"
            title="Preview clip"
          >
            <Play :size="24" fill="currentColor" />
          </a>
        </div>

        <!-- Video Info -->
        <div class="creative-card-body">
          <div class="card-meta">
            <span class="category-pill">{{ video.category }}</span>
            <span class="likes-count" style="display: inline-flex; align-items: center; gap: 3px;">
              <Heart :size="11" fill="currentColor" />
              <span>{{ video.likes }}</span>
            </span>
          </div>
          <h3 class="video-title">{{ video.title }}</h3>

          <!-- Download Action Button -->
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

          <!-- Human Captions Accordion / Box -->
          <div class="captions-section">
            <div class="captions-header">
              <span class="captions-label">
                <Sparkles :size="12" /> Authentic Human Captions (Ready to post)
              </span>
            </div>

            <div class="captions-list">
              <div
                v-for="(cap, cIdx) in getCaptionsForItem(video)"
                :key="cIdx"
                class="caption-card"
              >
                <div style="flex: 1;">
                  <p class="caption-text">"{{ cap }}"</p>
                  <!-- 2026 Viral Potential & Sentiment Badges -->
                  <div style="display: flex; align-items: center; gap: 6px; margin-top: 6px; flex-wrap: wrap;">
                    <span
                      style="font-size: 10px; font-weight: 700; padding: 1px 6px; border-radius: 999px; background: rgba(16, 185, 129, 0.12); color: #10b981; border: 1px solid rgba(16, 185, 129, 0.25); display: inline-flex; align-items: center; gap: 3px;"
                    >
                      <Rocket :size="10" />
                      <span>Viral Score: {{ predictViralReach(cap).overallScore }}%</span>
                    </span>
                    <span
                      style="font-size: 10px; font-weight: 600; padding: 1px 6px; border-radius: 999px; background: rgba(59, 130, 246, 0.1); color: #60a5fa; display: inline-flex; align-items: center; gap: 3px;"
                    >
                      <Sparkles :size="10" />
                      <span>Hook: {{ predictViralReach(cap).hookScore }}%</span>
                    </span>
                    <span
                      style="font-size: 10px; padding: 1px 6px; border-radius: 999px; background: rgba(255, 255, 255, 0.05); color: #94a3b8;"
                    >
                      {{ predictViralReach(cap).sentimentTone }}
                    </span>
                  </div>
                </div>
                <button
                  class="copy-caption-btn"
                  :class="{ 'copied': copiedCaptionId === `${video.id}-${cIdx}` }"
                  @click="copyCaption(cap, `${video.id}-${cIdx}`)"
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
    </div>
  </div>
</template>

<style scoped>
@import './creative-hub.css';
</style>
