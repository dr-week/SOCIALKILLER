<script setup lang="ts">
import { ArrowLeft, Check, HardDrive, Instagram, Palette, RefreshCw, Trash2 } from 'lucide-vue-next'
import type { AccentTheme, AccountSummary, ThemeMode } from '../../types'

defineProps<{
  currentTheme: ThemeMode
  currentAccent: AccentTheme
  databaseStats: { bytes: number; display: string }
  accounts: AccountSummary[]
  currentAccountUsername: string
}>()

const emit = defineEmits<{
  (e: 'back'): void
  (e: 'setTheme', theme: ThemeMode): void
  (e: 'setAccent', accent: AccentTheme): void
  (e: 'removeAccount', username: string): void
  (e: 'refreshCurrentAccount'): void
  (e: 'cleanExpiredCache'): void
  (e: 'exportDatabaseBackup'): void
  (e: 'triggerRestore'): void
  (e: 'resetData'): void
}>()

const accentOptions: Array<{ value: AccentTheme; label: string; color: string }> = [
  { value: 'coral', label: 'Coral', color: '#ff7b88' },
  { value: 'violet', label: 'Violet', color: '#b495ff' },
  { value: 'cyan', label: 'Cyan', color: '#54d6ee' },
  { value: 'mint', label: 'Mint', color: '#59ddb6' },
  { value: 'orange', label: 'Orange', color: '#ffad68' }
]
</script>

<template>
  <section class="settings-view" aria-label="Settings">
    <header class="settings-view-header">
      <button class="settings-back" @click="emit('back')">
        <ArrowLeft :size="14" />
        <span>Back</span>
      </button>
      <h2>Settings</h2>
    </header>

    <div class="settings-section">
      <label class="settings-label" for="sidebar-theme"><Palette :size="14" /> Theme</label>
      <select
        id="sidebar-theme"
        class="settings-select"
        :value="currentTheme"
        @change="emit('setTheme', ($event.target as HTMLSelectElement).value as ThemeMode)"
      >
        <option value="auto">System</option>
        <option value="light">Light</option>
        <option value="dark">Dark</option>
      </select>
    </div>

    <div class="settings-section">
      <div class="settings-label"><Palette :size="14" /> Accent</div>
      <div class="accent-options" role="group" aria-label="Accent color">
        <button
          v-for="option in accentOptions"
          :key="option.value"
          class="accent-option"
          :class="{ 'accent-option--selected': currentAccent === option.value }"
          :style="{ '--swatch': option.color }"
          type="button"
          :aria-label="`${option.label} accent`"
          :aria-pressed="currentAccent === option.value"
          :title="option.label"
          @click="emit('setAccent', option.value)"
        >
          <Check v-if="currentAccent === option.value" :size="14" />
        </button>
      </div>
    </div>

    <section class="settings-section" aria-label="Audit profiles">
      <div class="settings-label"><Instagram :size="14" /> Audit profiles</div>
      <div v-if="accounts.length" class="settings-profile-list">
        <div v-for="account in accounts" :key="account.username" class="settings-profile-row">
          <span>@{{ account.username }}</span>
          <button
            class="drawer-close"
            :aria-label="`Remove @${account.username}`"
            title="Remove profile"
            @click="emit('removeAccount', account.username)"
          >
            <Trash2 :size="14" />
          </button>
        </div>
        <button
          v-if="currentAccountUsername"
          class="drawer-btn"
          title="Sync active audit profile"
          @click="emit('refreshCurrentAccount')"
        >
          <RefreshCw :size="14" /> Sync
        </button>
      </div>
      <p v-else class="settings-empty">Import an export in Audience Audit</p>
    </section>

    <details class="settings-local-data">
      <summary class="settings-label">
        <HardDrive :size="14" />
        <span>Local data</span>
        <small>{{ databaseStats.display }}</small>
      </summary>
      <div class="drawer-actions">
        <button class="drawer-btn" title="Clean expired cache" @click="emit('cleanExpiredCache')">Clean</button>
        <button class="drawer-btn" @click="emit('exportDatabaseBackup')">Backup</button>
        <button class="drawer-btn" @click="emit('triggerRestore')">Restore</button>
      </div>
      <details class="settings-reset">
        <summary>Reset</summary>
        <button class="drawer-btn drawer-btn--danger" @click="emit('resetData')">
          <Trash2 :size="14" /> Clear imported data
        </button>
      </details>
    </details>
  </section>
</template>

<style scoped lang="scss" src="./sidebar-settings-panel.scss"></style>
