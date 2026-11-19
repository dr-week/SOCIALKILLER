<script setup lang="ts">
import { Layers, Radio, Send } from 'lucide-vue-next'

export type PublisherTab = 'compose' | 'campaigns'

defineProps<{
  activeTab: PublisherTab
  activeCount: number
}>()

const emit = defineEmits<{
  (e: 'update:activeTab', tab: PublisherTab): void
  (e: 'open-connections'): void
}>()

const TABS: Array<{ id: PublisherTab; label: string; icon: any }> = [
  { id: 'compose', label: 'Create', icon: Send },
  { id: 'campaigns', label: 'Queue', icon: Layers }
]
</script>

<template>
  <header class="publisher-minimal-header">
    <div class="brand-badge">
      <div class="pulse-dot"></div>
      <span class="brand-title">Planner</span>
    </div>

    <nav class="publisher-tabs" aria-label="Planner views">
      <button
        v-for="t in TABS"
        :key="t.id"
        class="tab-btn"
        :class="{ active: activeTab === t.id }"
        @click="emit('update:activeTab', t.id)"
      >
        <component :is="t.icon" class="tab-icon" />
        <span class="tab-label">{{ t.label }}</span>
      </button>
    </nav>

    <button
      type="button"
      class="stat-pill"
      title="Open Connections"
      @click="emit('open-connections')"
    >
      <Radio class="pill-icon text-emerald" />
      <span class="pill-val">{{ activeCount }}</span>
      <span class="pill-lbl">Channels</span>
    </button>
  </header>
</template>

<style scoped lang="scss" src="./publisher-navbar.scss"></style>
