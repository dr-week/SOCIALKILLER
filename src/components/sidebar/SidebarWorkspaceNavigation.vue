<script setup lang="ts">
import { computed } from 'vue'
import { Instagram, Send } from 'lucide-vue-next'
import type { AccountSummary, NavItem, View } from '../../types'

const props = defineProps<{
  activeView: View
  nav: NavItem[]
  currentAccountUsername: string
  accounts: AccountSummary[]
}>()

const emit = defineEmits<{
  (e: 'update:activeView', view: View): void
  (e: 'switchAccount', username: string): void
  (e: 'close'): void
}>()

const publishViews: View[] = ['social-publisher', 'community-inbox']
const isPublishingWorkspace = computed(() => publishViews.includes(props.activeView))
const shortLabels: Partial<Record<View, string>> = {
  'social-publisher': 'Planner',
  'community-inbox': 'Inbox'
}
const accessibleLabels: Partial<Record<View, string>> = {
  'social-publisher': 'Content Planner & Publisher',
  'community-inbox': 'Chatbot & Community Inbox'
}

function selectView(view: View) {
  emit('update:activeView', view)
  emit('close')
}
</script>

<template>
  <div class="sidebar-main">
    <div class="workspace-pill-switcher" role="group" aria-label="Workspace">
      <button
        type="button"
        class="workspace-pill"
        :class="{ active: isPublishingWorkspace }"
        :aria-pressed="isPublishingWorkspace"
        aria-label="Publishing workspace"
        title="Publishing & Growth"
        @click="selectView('social-publisher')"
      >
        <Send :size="13" />
        <span>Publish</span>
      </button>
      <button
        type="button"
        class="workspace-pill"
        :class="{ active: !isPublishingWorkspace }"
        :aria-pressed="!isPublishingWorkspace"
        aria-label="Audience Audit workspace"
        title="Audience Audit"
        @click="selectView('overview')"
      >
        <Instagram :size="13" />
        <span>Audit</span>
      </button>
    </div>

    <section v-if="accounts.length" class="accounts-chip-list" aria-label="Audit profiles">
      <div class="accounts-header">Profiles</div>
      <div class="accounts-scroll">
        <button
          v-for="account in accounts"
          :key="account.username"
          type="button"
          class="account-chip"
          :class="{ active: currentAccountUsername.toLowerCase() === account.username.toLowerCase() }"
          :aria-current="currentAccountUsername.toLowerCase() === account.username.toLowerCase() ? 'true' : undefined"
          @click="emit('switchAccount', account.username)"
        >
          <span class="chip-dot"></span>
          <span class="chip-username">@{{ account.username }}</span>
          <span class="chip-count">{{ account.followersCount.toLocaleString() }}</span>
        </button>
      </div>
    </section>

    <nav class="navigation" aria-label="Main navigation">
      <button
        v-for="item in nav"
        :key="item.id"
        type="button"
        class="nav-item"
        :class="{ 'nav-item--active': activeView === item.id }"
        :aria-current="activeView === item.id ? 'page' : undefined"
        :aria-label="accessibleLabels[item.id] || item.label"
        :title="accessibleLabels[item.id] || item.label"
        @click="selectView(item.id)"
      >
        <component :is="item.icon" class="nav-icon" :size="16" :stroke-width="2" />
        <span>{{ shortLabels[item.id] || item.label }}</span>
        <span v-if="typeof item.count === 'function' && (item.count() ?? 0) > 0" class="nav-count">
          {{ item.count() }}
        </span>
      </button>
    </nav>
  </div>
</template>

<style scoped lang="scss" src="./sidebar-workspace-navigation.scss"></style>
