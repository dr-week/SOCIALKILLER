<script setup lang="ts">
import { ArrowRight, Check, Copy, MessageCircle } from 'lucide-vue-next'
import PlatformIcon from '../../common/PlatformIcon.vue'
import type { NewsRemodelOutput } from './types'

defineProps<{ output: NewsRemodelOutput; copiedKey: string | null }>()
const emit = defineEmits<{
  (event: 'copy', key: string, text: string): void
  (event: 'useTopic'): void
}>()
</script>

<template>
  <div class="remodel-results">
    <div class="variant-block">
      <div class="variant-header"><span class="platform-label"><PlatformIcon platform="x" :size="12" />X / Twitter Thread Starter</span>
        <button class="pub-btn-tiny" @click="emit('copy', 'X', output.variants.x)"><component :is="copiedKey === 'X' ? Check : Copy" :size="11" />{{ copiedKey === 'X' ? 'Copied' : 'Copy' }}</button>
      </div>
      <pre class="variant-text">{{ output.variants.x }}</pre>
    </div>
    <div class="variant-block reply-box">
      <div class="variant-header"><span class="platform-label"><MessageCircle :size="12" />X Reply (GitHub Repo + Link)</span>
        <button class="pub-btn-tiny" @click="emit('copy', 'Reply', output.variants.x_reply)"><component :is="copiedKey === 'Reply' ? Check : Copy" :size="11" />{{ copiedKey === 'Reply' ? 'Copied' : 'Copy' }}</button>
      </div>
      <pre class="variant-text">{{ output.variants.x_reply }}</pre>
    </div>
    <div class="variant-block">
      <div class="variant-header"><span class="platform-label"><PlatformIcon platform="reddit" :size="12" />Reddit & LinkedIn Format</span>
        <button class="pub-btn-tiny" @click="emit('copy', 'Reddit', output.variants.reddit)"><component :is="copiedKey === 'Reddit' ? Check : Copy" :size="11" />Copy Reddit</button>
      </div>
      <pre class="variant-text">{{ output.variants.reddit }}</pre>
    </div>
    <button class="pub-btn primary full-width" @click="emit('useTopic')">
      <ArrowRight :size="14" /><span>Load into Omni-Channel Composer & Broadcast Everywhere</span>
    </button>
  </div>
</template>

<style scoped>
@import '../publisher-shared.css';
.remodel-results { display: flex; flex-direction: column; gap: 10px; }
.variant-block { background: rgba(0,0,0,.35); border: 1px solid rgba(255,255,255,.08); border-radius: 8px; padding: 8px 10px; }
.variant-block.reply-box { border-left: 3px solid #10b981; }
.variant-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; }
.platform-label { display: inline-flex; align-items: center; gap: 5px; font-size: 11px; font-weight: 700; color: #38bdf8; }
.pub-btn-tiny { display: inline-flex; align-items: center; gap: 4px; padding: 3px 8px; border-radius: 4px; font-size: 10px; background: rgba(255,255,255,.08); border: 1px solid rgba(255,255,255,.15); color: #f1f5f9; cursor: pointer; }
.variant-text { font-family: inherit; font-size: 12px; color: #e2e8f0; white-space: pre-wrap; line-height: 1.4; margin: 0; }
.full-width { width: 100%; }
</style>
