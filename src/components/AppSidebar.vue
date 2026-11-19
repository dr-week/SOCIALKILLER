<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { Settings } from 'lucide-vue-next'
import type { View, AccountSummary, AccentTheme, ThemeMode } from '../types'
import SidebarSettingsPanel from './sidebar/SidebarSettingsPanel.vue'
import MiniAppNavigation from './sidebar/MiniAppNavigation.vue'

const props = defineProps<{
  activeView: View
  menuOpen: boolean
  currentAccountUsername: string
  followersCount: number
  databaseStats: { bytes: number; display: string }
  accounts: AccountSummary[]
  currentTheme: ThemeMode
  currentAccent: AccentTheme
}>()

const emit = defineEmits<{
  (e: 'update:activeView', val: View): void
  (e: 'update:menuOpen', val: boolean): void
  (e: 'switchAccount', username: string): void
  (e: 'removeAccount', username: string): void
  (e: 'refreshCurrentAccount'): void
  (e: 'resetData'): void
  (e: 'cleanExpiredCache'): void
  (e: 'exportDatabaseBackup'): void
  (e: 'triggerRestore'): void
  (e: 'setTheme', val: ThemeMode): void
  (e: 'setAccent', val: AccentTheme): void
}>()

const showSettings = ref(false)
const isMobile = ref(false)
let mobileMedia: MediaQueryList | undefined
const updateMobile = () => { isMobile.value = mobileMedia?.matches ?? false }
const avatarInitials = computed(() => props.currentAccountUsername.slice(0, 2).toUpperCase() || 'IG')
const profileTitle = computed(() => props.currentAccountUsername ? `@${props.currentAccountUsername}` : 'Local workspace')
const profileSubtitle = computed(() => props.currentAccountUsername
  ? `${props.followersCount.toLocaleString()} followers`
  : 'No data imported')

watch(() => props.menuOpen, isOpen => {
  if (!isOpen) showSettings.value = false
})

onMounted(() => {
  mobileMedia = window.matchMedia('(max-width: 820px)')
  updateMobile()
  mobileMedia.addEventListener('change', updateMobile)
})

onUnmounted(() => mobileMedia?.removeEventListener('change', updateMobile))

function closeDrawer() {
  showSettings.value = false
  emit('update:menuOpen', false)
}

function selectView(view: View) {
  emit('update:activeView', view)
  closeDrawer()
}
</script>

<template>
  <button
    v-if="menuOpen && isMobile"
    class="sidebar-backdrop"
    aria-label="Close navigation drawer"
    @click="closeDrawer"
  ></button>
  <aside id="navigation-drawer" class="sidebar" :class="{ 'sidebar--open': menuOpen }" :aria-hidden="isMobile && !menuOpen" :tabindex="isMobile ? -1 : undefined" :role="isMobile ? 'dialog' : undefined" :aria-modal="isMobile && menuOpen ? 'true' : undefined" aria-label="Main navigation">
    <div class="sidebar-header">
      <a class="brand" href="#" @click.prevent="selectView('app-launcher')">
        <img class="brand-mark" src="/branding/social-base-logo.png" alt="" />
        <span>SOCIAL<span class="brand-accent">KILLER</span></span>
      </a>
    </div>

    <MiniAppNavigation v-if="!showSettings" :active-view="activeView" @select="selectView" />

    <SidebarSettingsPanel
      v-else
      :current-theme="currentTheme"
      :current-accent="currentAccent"
      :database-stats="databaseStats"
      :accounts="accounts"
      :current-account-username="currentAccountUsername"
      @back="showSettings = false"
      @set-theme="emit('setTheme', $event)"
      @set-accent="emit('setAccent', $event)"
      @remove-account="emit('removeAccount', $event)"
      @refresh-current-account="emit('refreshCurrentAccount')"
      @clean-expired-cache="emit('cleanExpiredCache')"
      @export-database-backup="emit('exportDatabaseBackup')"
      @trigger-restore="emit('triggerRestore')"
      @reset-data="emit('resetData')"
    />

    <div class="sidebar-bottom">
      <div class="sidebar-footer-row">
        <button
          v-if="!showSettings"
          class="settings-toggle-btn"
          title="Open settings"
          @click="showSettings = true"
        >
          <Settings :size="14" />
          <span>Settings</span>
        </button>

        <div class="profile-card">
          <div class="avatar">{{ avatarInitials }}</div>
          <div class="profile-info">
            <strong>{{ profileTitle }}</strong>
            <span>{{ profileSubtitle }}</span>
          </div>
        </div>
      </div>
    </div>
  </aside>
</template>

<style scoped lang="scss" src="./sidebar/app-sidebar.scss"></style>
