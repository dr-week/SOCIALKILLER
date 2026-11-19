<script setup lang="ts">
import { computed } from 'vue'
import { ExternalLink, MessageSquare, Repeat2, Bookmark, Share2, Bot } from 'lucide-vue-next'
import type { PlatformId } from '../../types'

const props = defineProps<{ platform: PlatformId; brandName: string; content: string; webLink?: string; mediaUrl?: string; badge: { icon: string; color: string; bg: string; label: string } }>()
const cleanHandle = computed(() => props.brandName.toLowerCase().replace(/[^a-z0-9]+/g, '').slice(0, 20) || 'company')
const parsedReddit = computed(() => {
  const lines = props.content.split('\n')
  const titleLine = lines.find(line => line.trim()) || 'Discussion Post'
  return { title: titleLine.replace(/^#+\s*/, ''), body: lines.slice(1).join('\n').trim() || 'No body content provided.' }
})
</script>

<template>
    <div v-if="platform === 'x'" class="mock-x-card">
      <div class="mock-avatar-col">
        <div class="mock-avatar" style="background: linear-gradient(135deg, #38bdf8, #0284c7)">𝕏</div>
      </div>
      <div class="mock-content-col">
        <div class="mock-author-row">
          <span class="mock-author-name">{{ brandName }}</span>
          <span class="mock-author-handle">@{{ cleanHandle }} · Just now</span>
        </div>
        <p class="mock-text">{{ content }}</p>
        <div v-if="mediaUrl" class="mock-media-wrap">
          <img :src="mediaUrl" alt="Attached Media" />
        </div>
        <div v-if="webLink" class="mock-link-preview">
          <span class="mock-link-domain">{{ webLink.replace(/^https?:\/\//, '').split('/')[0] }}</span>
          <span class="mock-link-url">{{ webLink }}</span>
        </div>
        <div class="mock-action-row">
          <span class="mock-action-btn"><MessageSquare :size="12" /> 24</span>
          <span class="mock-action-btn"><Repeat2 :size="13" /> 89</span>
          <span class="mock-action-btn"><Bookmark :size="12" /> 142</span>
          <span class="mock-action-btn"><Share2 :size="12" /></span>
        </div>
      </div>
    </div>

    <!-- Reddit Post Simulation -->
    <div v-else-if="platform === 'reddit'" class="mock-reddit-card">
      <div class="reddit-header">
        <span class="subreddit-tag">r/webdev</span>
        <span class="reddit-author">• Posted by u/{{ cleanHandle }} 2m ago</span>
        <span class="reddit-flair">Showoff Saturday</span>
      </div>
      <h3 class="reddit-title">{{ parsedReddit.title }}</h3>
      <div class="reddit-body">
        <pre class="reddit-markdown">{{ parsedReddit.body }}</pre>
      </div>
      <div v-if="mediaUrl" class="mock-media-wrap" style="margin-top: 8px;">
        <img :src="mediaUrl" alt="Attached Media" style="width: 100%; border-radius: 8px; max-height: 200px; object-fit: cover;" />
      </div>
      <div v-if="webLink" class="reddit-link-chip">
        <ExternalLink :size="12" />
        <a :href="webLink" target="_blank" rel="noopener">{{ webLink }}</a>
      </div>
    </div>

    <!-- Discord Webhook Simulation -->
    <div v-else-if="platform === 'discord'" class="mock-discord-card">
      <div class="discord-avatar-col">
        <div class="discord-avatar" style="display: flex; align-items: center; justify-content: center;">
          <Bot :size="16" />
        </div>
      </div>
      <div class="discord-content-col">
        <div class="discord-header">
          <span class="discord-bot-name">Growth Autopilot</span>
          <span class="discord-bot-tag">BOT</span>
          <span class="discord-time">Today at 12:00 PM</span>
        </div>
        <div class="discord-embed">
          <div class="discord-embed-bar"></div>
          <div class="discord-embed-content">
            <h4 class="discord-embed-title">{{ parsedReddit.title }}</h4>
            <p class="discord-embed-desc">{{ parsedReddit.body }}</p>
            <div v-if="mediaUrl" style="margin: 8px 0; border-radius: 6px; overflow: hidden;">
              <img :src="mediaUrl" alt="Discord Media" style="width: 100%; max-height: 180px; object-fit: cover;" />
            </div>
            <div v-if="webLink" class="discord-field">
              <span class="field-label">Reference</span>
              <a :href="webLink" class="field-val" target="_blank">{{ webLink }}</a>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Dev.to / Blog Editorial Simulation -->
    <div v-else-if="platform === 'devto' || platform === 'hashnode' || platform === 'medium'" class="mock-blog-card">
      <div class="blog-meta">
        <span class="blog-author">{{ brandName }}</span>
        <span class="blog-date">Oct 19 • 4 min read</span>
      </div>
      <div v-if="mediaUrl" style="margin-bottom: 10px; border-radius: 8px; overflow: hidden;">
        <img :src="mediaUrl" alt="Cover" style="width: 100%; max-height: 160px; object-fit: cover;" />
      </div>
      <h2 class="blog-heading">{{ parsedReddit.title }}</h2>
      <div class="blog-tags">
        <span class="tag-pill">#webdev</span>
        <span class="tag-pill">#javascript</span>
        <span class="tag-pill">#architecture</span>
      </div>
      <div class="blog-body-preview">
        {{ parsedReddit.body }}
      </div>
    </div>

    <!-- Generic Fallback Preview -->
    <div v-else class="mock-generic-card">
      <div class="generic-header">
        <span class="generic-label">{{ badge.label }}</span>
      </div>
      <p class="generic-text">{{ content }}</p>
      <div v-if="mediaUrl" style="margin: 8px 0; border-radius: 8px; overflow: hidden;">
        <img :src="mediaUrl" alt="Media" style="width: 100%; max-height: 160px; object-fit: cover;" />
      </div>
      <div v-if="webLink" class="generic-link">
        <ExternalLink :size="12" /> {{ webLink }}
      </div>
    </div>
</template>
