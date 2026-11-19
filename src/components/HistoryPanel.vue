<script setup lang="ts">
import {
  History,
  FileText,
  TrendingUp,
  TrendingDown
} from 'lucide-vue-next'
import type { Snapshot } from '../domain/followers'
import type { View } from '../types'

defineProps<{
  previous: Snapshot | null
  importedAt: string
  newFollowersCount: number
  lostFollowersCount: number
  followersCount: number
  lastSynced: string
}>()

const emit = defineEmits<{
  (e: 'selectView', val: View): void
  (e: 'triggerImport'): void
  (e: 'loadDemo'): void
}>()
</script>

<template>
  <div class="right-column">
    <div class="panel activity-panel">
      <div class="panel-heading">
        <h2>Follower Changes</h2>
        <History :size="18" class="round-icon-svg" />
      </div>
      <div class="snapshot-card">
        <div class="snapshot-icon">
          <FileText :size="16" />
        </div>
        <div class="snapshot-info">
          <strong>{{ previous ? 'Comparison Snapshot' : 'Baseline Snapshot' }}</strong>
          <span v-if="previous || importedAt">{{ previous ? new Date(previous.date).toLocaleDateString() : new Date(importedAt).toLocaleDateString() }}</span>
        </div>
      </div>

      <div class="change-row" style="cursor: pointer;" @click="emit('selectView', 'new-followers')">
        <div class="change-indicator change-indicator--green">
          <TrendingUp :size="14" />
        </div>
        <div>
          <strong>{{ previous ? `+${newFollowersCount} new followers` : `${followersCount} followers loaded` }}</strong>
          <span>{{ previous ? 'Accounts who recently followed you' : 'Initial baseline snapshot' }}</span>
        </div>
        <span class="change-count">{{ previous ? `+${newFollowersCount}` : '—' }}</span>
      </div>

      <div class="change-row" style="cursor: pointer;" @click="emit('selectView', 'lost-followers')">
        <div class="change-indicator change-indicator--red">
          <TrendingDown :size="14" />
        </div>
        <div>
          <strong>{{ previous ? `${lostFollowersCount} unfollowers / lost` : '0 lost followers recorded' }}</strong>
          <span>{{ previous ? 'Accounts that unfollowed you' : 'Import a second export later to see lost followers' }}</span>
        </div>
        <span class="change-count change-count--red">{{ previous ? `−${lostFollowersCount}` : '—' }}</span>
      </div>

      <div class="panel-footer">
        <span v-if="lastSynced">LAST SYNCED <strong>{{ lastSynced }}</strong></span>
        <button @click="emit('triggerImport')">Update with new export →</button>
      </div>
    </div>
  </div>
</template>
