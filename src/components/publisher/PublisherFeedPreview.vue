<script setup lang="ts">
import { computed } from 'vue'
import type { PlatformId } from '../../types'
import PlatformFeedPreviewBody from './PlatformFeedPreviewBody.vue'

const props = defineProps<{ platform: PlatformId; brandName: string; content: string; webLink?: string; mediaUrl?: string; badge: { icon: string; color: string; bg: string; label: string }; characterCount: number; maxCharacters?: number }>()
const charPercentage = computed(() => Math.min(100, Math.round((props.characterCount / (props.maxCharacters || 280)) * 100)))
</script>

<template>
  <div class="feed-preview-card" :data-platform="platform">
    <div class="card-platform-header">
      <div class="platform-meta">
        <span class="platform-icon" :style="{ background: badge.bg, color: badge.color }">{{ badge.icon }}</span>
        <span class="platform-title">{{ badge.label }} Live Mock</span>
      </div>
      <div class="platform-limits" v-if="maxCharacters">
        <div class="limit-track"><div class="limit-fill" :style="{ width: `${charPercentage}%`, backgroundColor: charPercentage > 95 ? '#ef4444' : badge.color }"></div></div>
        <span class="limit-text" :class="{ 'text-danger': characterCount > maxCharacters }">{{ characterCount }}/{{ maxCharacters }}</span>
      </div>
    </div>
    <PlatformFeedPreviewBody v-bind="{ platform, brandName, content, webLink, mediaUrl, badge }" />
  </div>
</template>

<style lang="scss">
@use './styles/feed-preview-base.scss';
@use './styles/feed-preview-x.scss';
@use './styles/feed-preview-community.scss';
@use './styles/feed-preview-editorial.scss';
</style>
