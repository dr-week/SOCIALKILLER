<script setup lang="ts">
import { computed, ref } from 'vue'
import type { LucideIcon } from 'lucide-vue-next'

const props = defineProps<{
  title: string
  badge?: string
  icon?: LucideIcon
  tabs: string[]
  activeTab?: string
}>()

const emit = defineEmits<{
  (e: 'update:activeTab', tab: string): void
}>()

const selectedTab = ref(props.activeTab || props.tabs[0] || 'overview')

function setTab(tab: string) {
  selectedTab.value = tab
  emit('update:activeTab', tab)
}
</script>

<template>
  <main class="dept-shell">
    <header class="shell-header">
      <div class="header-left">
        <component :is="icon" v-if="icon" class="dept-icon" :size="24" />
        <div class="title-group">
          <div class="eyebrow-row">
            <span class="eyebrow">DANGER.LABS OS</span>
            <span v-if="badge" class="badge-pill">{{ badge }}</span>
          </div>
          <h1>{{ title }}</h1>
        </div>
      </div>
      <div class="header-actions">
        <slot name="actions" />
      </div>
    </header>

    <div v-if="tabs.length" class="sub-nav-tabs">
      <button
        v-for="tab in tabs"
        :key="tab"
        type="button"
        class="tab-btn"
        :class="{ active: selectedTab === tab }"
        @click="setTab(tab)"
      >
        {{ tab }}
      </button>
    </div>

    <section class="shell-content">
      <slot :current-tab="selectedTab" />
    </section>
  </main>
</template>

<style scoped>
.dept-shell {
  max-width: 1320px;
  margin: 0 auto;
  padding: 24px;
  color: var(--text-primary, #e2e8f0);
}
.shell-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}
.header-left {
  display: flex;
  align-items: center;
  gap: 14px;
}
.dept-icon {
  color: #38bdf8;
}
.eyebrow-row {
  display: flex;
  align-items: center;
  gap: 8px;
}
.eyebrow {
  font-size: 11px;
  letter-spacing: 0.12em;
  font-weight: 700;
  color: #64748b;
}
.badge-pill {
  font-size: 10px;
  font-weight: 700;
  padding: 2px 7px;
  border-radius: 99px;
  background: #1e293b;
  border: 1px solid #334155;
  color: #38bdf8;
}
.title-group h1 {
  font-size: 24px;
  font-weight: 700;
  margin: 2px 0 0 0;
  color: #f8fafc;
}
.sub-nav-tabs {
  display: flex;
  gap: 8px;
  border-bottom: 1px solid #1e293b;
  padding-bottom: 12px;
  margin-bottom: 24px;
  overflow-x: auto;
}
.tab-btn {
  background: transparent;
  border: 1px solid transparent;
  color: #94a3b8;
  padding: 6px 14px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  text-transform: capitalize;
  transition: all 0.15s ease;
}
.tab-btn:hover {
  background: #1e293b;
  color: #f1f5f9;
}
.tab-btn.active {
  background: #1e293b;
  border-color: #334155;
  color: #38bdf8;
}
.shell-content {
  min-height: 480px;
}
</style>
