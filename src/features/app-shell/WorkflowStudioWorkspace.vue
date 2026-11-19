<script setup lang="ts">
import { Workflow } from 'lucide-vue-next'
import PublisherAutopilot from '../../components/publisher/PublisherAutopilot.vue'

defineProps<{ brandId: string; brandName: string }>()
</script>

<template>
  <main class="workflow-workspace">
    <header><h1><Workflow :size="20" style="vertical-align: -3px; margin-right: 8px; color: var(--purple);" />Workflows</h1></header>
    <PublisherAutopilot :brand-id="brandId" />
  </main>
</template>

<style scoped>
.workflow-workspace { max-width: 1080px; margin: 0 auto; }
.workflow-workspace header { display: grid; gap: 7px; margin-bottom: 16px; padding: 20px 22px; border: 1px solid var(--glass-border); border-radius: 20px; background: radial-gradient(ellipse at 100% 0%, color-mix(in srgb, var(--purple) 14%, transparent), transparent 50%), var(--surface-card); box-shadow: var(--card-shadow); }
.workflow-workspace h1 { margin: 0; font: 700 clamp(24px, 3vw, 29px) Manrope, sans-serif; letter-spacing: -.03em; }
</style>
