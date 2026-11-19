<script setup lang="ts">
import {
  History,
  FileText,
  TrendingUp,
  TrendingDown,
  Sparkles,
  Star
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
        <div>
          <span class="section-kicker">HISTORY & UNFOLLOWERS</span>
          <h2>Follower Changes</h2>
        </div>
        <History :size="18" class="round-icon-svg" />
      </div>
      <div class="snapshot-card">
        <div class="snapshot-icon">
          <FileText :size="16" />
        </div>
        <div class="snapshot-info">
          <strong>{{ previous ? 'Comparison Snapshot' : 'Baseline Snapshot' }}</strong>
          <span>{{ previous ? new Date(previous.date).toLocaleDateString() : importedAt ? new Date(importedAt).toLocaleDateString() : 'Awaiting first export' }}</span>
        </div>
        <span class="snapshot-live">{{ previous ? 'DIFF ACTIVE' : 'ACTIVE' }}</span>
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
        <span>LAST SYNCED <strong>{{ lastSynced }}</strong></span>
        <button @click="emit('triggerImport')">Update with new export →</button>
      </div>
    </div>

    <div class="tip-card">
      <div class="tip-top">
        <div class="tip-icon"><Sparkles :size="14" /></div>
        <span class="tip-tag">WHITELIST PROTECTION</span>
      </div>
      <h3>Protect Favorite Accounts</h3>
      <p>Click the <Star :size="11" style="display:inline; vertical-align:middle; color:#eab308;" /> star next to celebrities, influencers, or news accounts to keep them on your Whitelist so they never clutter your "Don't follow back" list.</p>
      <button @click="emit('loadDemo')">
        <Sparkles :size="12" /> Reload Demo Data
      </button>
    </div>
  </div>
</template>
