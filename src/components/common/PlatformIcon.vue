<script setup lang="ts">
import { computed } from 'vue'
import {
  Instagram,
  Linkedin,
  Github,
  Bot,
  Globe,
  Radio,
  FileCode,
  BookOpen,
  Edit3
} from 'lucide-vue-next'
import type { PlatformId } from '../../types'

const props = withDefaults(
  defineProps<{
    platform?: PlatformId | string
    size?: number
    strokeWidth?: number
  }>(),
  {
    size: 14,
    strokeWidth: 2
  }
)

const normalized = computed(() => (props.platform || '').toLowerCase())
</script>

<template>
  <span class="platform-icon-root" :style="{ width: `${size}px`, height: `${size}px` }">
    <!-- Instagram -->
    <Instagram v-if="normalized === 'instagram'" :size="size" :stroke-width="strokeWidth" />

    <!-- X / Twitter -->
    <svg
      v-else-if="normalized === 'x' || normalized === 'twitter'"
      :width="size"
      :height="size"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>

    <!-- LinkedIn -->
    <Linkedin v-else-if="normalized === 'linkedin'" :size="size" :stroke-width="strokeWidth" />

    <!-- Reddit -->
    <svg
      v-else-if="normalized === 'reddit'"
      :width="size"
      :height="size"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm5.74-10.45a1.6 1.6 0 0 0-1.58-1.57 1.57 1.57 0 0 0-.96.33c-1.07-.74-2.52-1.22-4.14-1.28l.83-3.9 2.7.57a1.32 1.32 0 1 0 1.29-1.05 1.33 1.33 0 0 0-1.26.92l-3.03-.64a.27.27 0 0 0-.32.21l-.97 4.57c-1.66.04-3.14.53-4.22 1.28a1.57 1.57 0 0 0-.96-.33 1.6 1.6 0 0 0-1.58 1.57c0 .59.32 1.1.8 1.37a3.48 3.48 0 0 0-.05.58c0 2.92 3.42 5.28 7.64 5.28s7.64-2.36 7.64-5.28c0-.2-.02-.39-.06-.58.48-.27.8-.78.8-1.37zM9.25 13a1.25 1.25 0 1 1 0-2.5 1.25 1.25 0 0 1 0 2.5zm5.5 0a1.25 1.25 0 1 1 0-2.5 1.25 1.25 0 0 1 0 2.5zm-5.1 2.73a.35.35 0 0 1 .49-.07c.88.63 2.15.63 3.02 0a.35.35 0 1 1 .41.57c-1.12.8-2.72.8-3.84 0a.35.35 0 0 1-.08-.5z" />
    </svg>

    <!-- GitHub -->
    <Github v-else-if="normalized === 'github'" :size="size" :stroke-width="strokeWidth" />

    <!-- Discord -->
    <svg
      v-else-if="normalized === 'discord'"
      :width="size"
      :height="size"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.893.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
    </svg>

    <!-- Dev.to -->
    <FileCode v-else-if="normalized === 'devto'" :size="size" :stroke-width="strokeWidth" />

    <!-- Hashnode -->
    <BookOpen v-else-if="normalized === 'hashnode'" :size="size" :stroke-width="strokeWidth" />

    <!-- Medium -->
    <Edit3 v-else-if="normalized === 'medium'" :size="size" :stroke-width="strokeWidth" />

    <!-- AI Agent Market / AI Registry -->
    <Bot v-else-if="normalized === 'ai_registry'" :size="size" :stroke-width="strokeWidth" />

    <!-- Fallback -->
    <Globe v-else :size="size" :stroke-width="strokeWidth" />
  </span>
</template>

<style scoped>
.platform-icon-root {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  vertical-align: middle;
  flex-shrink: 0;
  line-height: 1;
}

.platform-icon-root svg {
  display: block;
}
</style>
