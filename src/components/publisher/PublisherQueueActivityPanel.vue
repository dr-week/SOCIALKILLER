<script setup lang="ts">
import { computed } from 'vue'
import { Activity, Zap } from 'lucide-vue-next'
import type { PlatformId } from '../../types'
import PlatformIcon from '../common/PlatformIcon.vue'

type ActivityLog = {
  id: string | number
  platformId?: PlatformId | null
  action: string
  timestamp: string
  message: string
  externalUrl?: string | null
  intentUrl?: string | null
}

const props = defineProps<{
  activityLogs: ActivityLog[]
  platformBadges: Record<PlatformId, { label: string }>
}>()
const recentActivity = computed(() => props.activityLogs.slice(0, 30))
const hasMoreActivity = computed(() => props.activityLogs.length > recentActivity.value.length)
</script>

<template>
  <div class="queue-card">
    <div class="card-head">
      <Activity :size="15" />
      <h4>Recent activity</h4>
      <span class="recent-count">Latest {{ recentActivity.length }}<template v-if="hasMoreActivity"> of {{ activityLogs.length }}</template></span>
    </div>

    <div class="log-stream">
      <div v-for="log in recentActivity" :key="log.id" class="stream-row">
        <span class="stream-emoji">
          <PlatformIcon v-if="log.platformId" :platform="log.platformId" :size="13" />
          <Zap v-else :size="13" />
        </span>
        <div class="stream-body">
          <div class="stream-head">
            <strong>{{ platformBadges[log.platformId as PlatformId]?.label || log.platformId }}</strong>
            <span class="tag">{{ log.action }}</span>
            <small>{{ new Date(log.timestamp).toLocaleTimeString() }}</small>
          </div>
          <p>{{ log.message }}</p>
          <a v-if="log.externalUrl" :href="log.externalUrl" target="_blank" class="stream-link">
            Open Live →
          </a>
          <a v-else-if="log.intentUrl" :href="log.intentUrl" target="_blank" class="stream-link">
            1-Click Launch →
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.queue-card {
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: 12px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.card-head { display: flex; align-items: center; gap: 8px; }
.card-head h4 { margin: 0; font-size: 13px; font-weight: 700; }
.recent-count { margin-left: auto; color: var(--muted); font-size: 10px; white-space: nowrap; }
.log-stream { display: flex; flex-direction: column; gap: 8px; max-height: 440px; overflow-y: auto; }
.stream-row { background: var(--bg-app); border: 1px solid var(--line); border-radius: 9px; padding: 11px; display: flex; flex-direction: row; align-items: flex-start; gap: 8px; }
.stream-emoji { font-size: 17px; }
.stream-body { flex: 1; font-size: 11px; }
.stream-head { display: flex; align-items: center; gap: 6px; margin-bottom: 3px; }
.stream-head .tag { font-size: 9px; padding: 1px 6px; border-radius: 4px; background: rgba(120, 87, 220, 0.12); color: var(--purple); }
.stream-head small { margin-left: auto; color: var(--muted); }
.stream-body p { margin: 0; font-size: 10px; color: var(--muted); }
.stream-link { display: inline-block; margin-top: 4px; font-size: 10px; font-weight: 700; color: var(--purple); text-decoration: none; }
</style>
