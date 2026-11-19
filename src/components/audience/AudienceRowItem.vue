<script setup lang="ts">
import {
  Download,
  ExternalLink,
  HelpCircle,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Star,
  StarOff,
  UserX,
  Users
} from 'lucide-vue-next'
import type { Person } from '../../domain/followers'
import type { AccountStatus, UserCategoryInfo, View } from '../../types'

defineProps<{
  person: Person
  index: number
  activeView: View
  isSelected: boolean
  accountStatus?: AccountStatus
  isWhitelisted: boolean
  category: UserCategoryInfo
  normalizeUsername: (username: string) => string
}>()

const emit = defineEmits<{
  (e: 'toggleSelect', username: string): void
  (e: 'checkHealth', username: string): void
  (e: 'toggleWhitelist', username: string): void
}>()
</script>

<template>
  <div class="person-row">
    <!-- Queue selection checkbox -->
    <input
      v-if="activeView === 'not-following-back' || activeView === 'ghost-followers'"
      type="checkbox"
      class="queue-checkbox"
      :checked="isSelected"
      @change="emit('toggleSelect', person.username)"
      :title="`Select @${person.username} for queue`"
      style="cursor: pointer; accent-color: var(--purple); margin-right: 4px;"
    />

    <div class="person-avatar" :class="`avatar-tone-${index % 5}`">
      {{ person.username.slice(0, 1).toUpperCase() }}
    </div>

    <div class="person-info" style="min-width: 0;">
      <div style="display: flex; align-items: center; gap: 8px;">
        <strong style="font-size: 11px;">@{{ person.username }}</strong>
        <span
          class="status-tag"
          :style="{
            color: category.color,
            background: category.bg,
            border: `1px solid ${category.color}33`,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            padding: '1px 6px',
            borderRadius: '999px',
            fontSize: '9.5px',
            fontWeight: '600'
          }"
        >
          <component :is="category.icon" :size="9.5" />
          {{ category.label }}
        </span>
      </div>
    </div>

    <!-- Health status badge -->
    <div class="account-status-wrap">
      <button
        v-if="!accountStatus"
        class="check-status-btn"
        @click="emit('checkHealth', person.username)"
        title="Verify if account is active or 404"
        style="padding: 2px 6px; font-size: 8px;"
      >
        <HelpCircle :size="11" /> Check
      </button>
      <span v-else-if="accountStatus.status === 'checking'" class="status-tag status-tag--checking">
        <Loader2 :size="10" class="spin-icon" />
      </span>
      <span v-else-if="accountStatus.status === 'deactivated'" class="status-tag status-tag--danger" :title="accountStatus.reason">
        <AlertCircle :size="10" /> 404
      </span>
      <span v-else-if="accountStatus.status === 'active'" class="status-tag status-tag--success" :title="accountStatus.reason">
        <CheckCircle2 :size="10" /> Active
      </span>
    </div>

    <!-- Whitelist Star -->
    <button
      class="whitelist-btn"
      :class="{ 'whitelist-btn--active': isWhitelisted }"
      @click="emit('toggleWhitelist', person.username)"
      :title="isWhitelisted ? 'Remove from Safe List' : 'Protect on Safe List'"
    >
      <component :is="isWhitelisted ? Star : StarOff" :size="13" />
    </button>

    <!-- Profile Picture Downloader & External Link -->
    <a
      class="profile-link"
      :href="`/api/instagram/download-proxy?url=https://www.instagram.com/${encodeURIComponent(person.username)}/&filename=${encodeURIComponent(person.username)}-profile.jpg`"
      target="_blank"
      :download="`${person.username}-dp.jpg`"
      :title="`Download @${person.username}'s DP`"
    >
      <Download :size="12" />
    </a>
    <a class="profile-link" :href="person.href" target="_blank" rel="noreferrer" :title="`Open @${person.username} on Instagram`">
      <ExternalLink :size="12" />
    </a>
  </div>
</template>
