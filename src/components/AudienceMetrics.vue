<script setup lang="ts">
import { computed } from 'vue'
import {
  UserX,
  UserCheck,
  Users,
  UserRound,
  ArrowUpRight,
  Sparkles,
  UserMinus
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

    <!-- Actionable Network Intelligence -->
    <section class="panel" style="margin-bottom: 24px; padding: 18px 20px; background: radial-gradient(ellipse at 100% 0%, color-mix(in srgb, var(--accent-primary) 12%, transparent), transparent 48%), linear-gradient(135deg, var(--surface-raised), var(--surface)); border: 1px solid var(--glass-border); border-radius: 18px;">
      <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 14px;">
        <div>
          <span class="section-kicker" style="color: var(--purple);">
            <Sparkles :size="12" style="display:inline; margin-right: 4px;" />
            ACTIONABLE NETWORK INTELLIGENCE
          </span>
          <h3 style="font-size: 16px; font-weight: 700; color: var(--ink); margin-top: 4px;">
            Audience Health Score: 
            <span :style="{ color: followersCount && (mutualsCount / followersCount) > 0.4 ? 'var(--status-success)' : 'var(--status-warning)' }">
              {{ healthScore }}/100
            </span>
          </h3>
          <p style="font-size: 12px; color: var(--muted); margin-top: 4px; line-height: 1.5;">
            Follower-to-Following Ratio: 
            <strong style="color: var(--ink);">{{ ratio }}</strong> 
            <span v-if="followingCount && followersCount / followingCount > 1.2" style="color: var(--status-success);"> (Healthy Creator Ratio)</span>
            <span v-else-if="followingCount && followersCount / followingCount < 0.8" style="color: var(--status-warning);"> (High Following Ratio)</span>
            <span v-else style="color: var(--muted);"> (Balanced Connection Ratio)</span>
            · <strong>{{ notFollowingBackCount }}</strong> accounts ready for unfollow review.
          </p>
        </div>
        <div style="display: flex; gap: 8px;">
          <button
            class="button button--outline button--small"
            @click="emit('selectView', 'not-following-back')"
            title="Review accounts you follow that don't follow back"
          >
            <UserX :size="13" />
            <span>Review Unfollowers ({{ notFollowingBackCount }})</span>
          </button>
          <button
            class="button button--outline button--small"
            @click="emit('selectView', 'lost-followers')"
            title="See users who recently unfollowed you"
          >
            <UserMinus :size="13" />
            <span>Recent Losses ({{ hasPrevious ? lostFollowersCount : 0 }})</span>
          </button>
        </div>
      </div>
    </section>
  </div>
</template>
