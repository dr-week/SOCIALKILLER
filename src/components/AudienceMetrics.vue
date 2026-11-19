<script setup lang="ts">
import { computed } from 'vue'
import {
  UserX,
  UserCheck,
  Users,
  UserRound,
  ArrowUpRight,
  Sparkles
} from 'lucide-vue-next'
import type { View } from '../types'

const props = defineProps<{
  notFollowingBackCount: number
  notFollowedBackCount: number
  mutualsCount: number
  followersCount: number
  followingCount: number
  lostFollowersCount: number
  hasPrevious: boolean
}>()

const emit = defineEmits<{
  (e: 'selectView', val: View): void
}>()

const healthScore = computed(() => {
  if (!props.followersCount) return 0
  return Math.min(
    100,
    Math.round(((props.mutualsCount + props.notFollowedBackCount * 0.5) / Math.max(1, props.followingCount)) * 100)
  )
})

const ratio = computed(() => {
  return props.followingCount ? (props.followersCount / props.followingCount).toFixed(2) : '1.00'
})

const followBackRate = computed(() => {
  return props.followersCount ? Math.round((props.mutualsCount / props.followersCount) * 100) : 0
})
</script>

<template>
  <div>
    <section class="stats-grid">
      <button class="stat-card" @click="emit('selectView', 'not-following-back')" title="Accounts you follow that do not follow back">
        <span class="stat-top">
          <span class="stat-icon stat-icon--peach"><UserX :size="15" /></span>
          <span class="stat-trend stat-trend--amber">NON-RECIPROCAL</span>
        </span>
        <strong>{{ notFollowingBackCount.toLocaleString() }}</strong>
        <span class="stat-label">Not following back <ArrowUpRight :size="12" /></span>
      </button>

      <button class="stat-card" @click="emit('selectView', 'not-followed-back')" title="Followers you do not follow back">
        <span class="stat-top">
          <span class="stat-icon stat-icon--blue"><UserCheck :size="15" /></span>
          <span class="stat-trend">FANS</span>
        </span>
        <strong>{{ notFollowedBackCount.toLocaleString() }}</strong>
        <span class="stat-label">You don’t follow back <ArrowUpRight :size="12" /></span>
      </button>

      <button class="stat-card" @click="emit('selectView', 'mutuals')" title="Accounts where both parties follow each other">
        <span class="stat-top">
          <span class="stat-icon stat-icon--mint"><Users :size="15" /></span>
          <span class="stat-trend stat-trend--green">MUTUALS</span>
        </span>
        <strong>{{ mutualsCount.toLocaleString() }}</strong>
        <span class="stat-label">Mutual follows ({{ followBackRate }}%) <ArrowUpRight :size="12" /></span>
      </button>

      <button class="stat-card" @click="emit('selectView', 'followers')" title="Total audience followers vs following">
        <span class="stat-top">
          <span class="stat-icon stat-icon--violet"><UserRound :size="15" /></span>
          <span class="stat-trend">AUDIENCE</span>
        </span>
        <strong>{{ followersCount.toLocaleString() }}</strong>
        <span class="stat-label">Following: {{ followingCount.toLocaleString() }} <ArrowUpRight :size="12" /></span>
      </button>
    </section>

    <section class="panel" style="margin-bottom: 18px; padding: 12px 16px; background: var(--glass-bg); backdrop-filter: blur(18px); border: 1px solid var(--glass-border); border-radius: 14px;">
      <div style="display: flex; align-items: center; gap: 10px; font-size: 13px; font-weight: 700;">
        <Sparkles :size="14" style="color: var(--purple);" />
        <span>Audience Health <strong :style="{ color: followersCount && (mutualsCount / followersCount) > 0.4 ? 'var(--status-success)' : 'var(--status-warning)' }">{{ healthScore }}/100</strong></span>
        <span style="color: var(--muted);">·</span>
        <span>Audience Ratio <strong style="color: var(--ink);">{{ ratio }}</strong></span>
      </div>
    </section>
  </div>
</template>
