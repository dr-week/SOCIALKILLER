<script setup lang="ts">
import { Workflow } from 'lucide-vue-next'
import PublisherAutopilot from '../../components/publisher/PublisherAutopilot.vue'

defineProps<{ brandId: string; brandName: string }>()
</script>

<template>
  <main class="workflow-workspace">
    <header>
      <p>LOCAL · REVIEWED · {{ brandName }}</p>
      <h1>Workflows</h1>
      <span><Workflow :size="14" /> Record and review safe browser steps. Replay is started explicitly from the companion extension on the matching site.</span>
    </header>
    <PublisherAutopilot :brand-id="brandId" />
  </main>
</template>

<style scoped>
.workflow-workspace { max-width: 1080px; margin: 0 auto; }
.workflow-workspace header { display: grid; gap: 7px; margin-bottom: 16px; padding: 20px 22px; border: 1px solid var(--glass-border); border-radius: 20px; background: radial-gradient(ellipse at 100% 0%, color-mix(in srgb, var(--purple) 14%, transparent), transparent 50%), var(--surface-card); box-shadow: var(--card-shadow); }
.workflow-workspace header p { margin: 0; color: var(--purple); font-size: 9px; font-weight: 700; letter-spacing: .12em; }
.workflow-workspace h1 { margin: 0; font: 700 clamp(24px, 3vw, 29px) Manrope, sans-serif; letter-spacing: -.03em; }
.workflow-workspace header span { display: flex; align-items: flex-start; gap: 6px; color: var(--muted); font-size: 11px; line-height: 1.55; }
.workflow-workspace header span svg { flex: 0 0 auto; color: var(--purple); }
</style>
