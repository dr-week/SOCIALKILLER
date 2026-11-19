<script setup lang="ts">
import { Flame, Zap } from 'lucide-vue-next'
import type { PlatformId, SocialPlatformStatus } from '../../types'
import MetaAccountManager from './MetaAccountManager.vue'
import PublisherChannelCard from './PublisherChannelCard.vue'

defineProps<{
  brandId: string
  platforms: SocialPlatformStatus[]
}>()

const emit = defineEmits<{
  (event: 'triggerKeepAlive', id?: PlatformId): void
  (event: 'savePlatform', platform: SocialPlatformStatus): void
  (event: 'assignAccount', platformId: string, handle: string): void
  (event: 'openIntent', id: PlatformId): void
  (event: 'metaUpdated'): void
  (event: 'platformUpdated', platform: SocialPlatformStatus): void
}>()

function assignAccount(platformId: string, handle: string) {
  emit('assignAccount', platformId, handle)
}
</script>

<template>
  <div class="channels-section">
    <MetaAccountManager :brand-id="brandId" @updated="emit('metaUpdated')" />
    <div class="channels-top-bar">
      <div class="top-title">
        <Flame :size="18" class="amber-icon" />
        <div>
          <h4>Company channels and credentials</h4>
          <p>Assign a channel handle to this company, then add credentials and test the connection.</p>
        </div>
      </div>
      <button class="pulse-all-btn" @click="emit('triggerKeepAlive')"><Zap :size="14" /><span>Pulse All Active Accounts</span></button>
    </div>

    <div class="channels-grid">
      <PublisherChannelCard
        v-for="platform in platforms"
        :key="platform.id"
        :brand-id="brandId"
        :platform="platform"
        @save="emit('savePlatform', $event)"
        @update="emit('platformUpdated', $event)"
        @assign="assignAccount"
        @keep-alive="emit('triggerKeepAlive', $event)"
        @open-intent="emit('openIntent', $event)"
      />
    </div>
  </div>
</template>

<style scoped>
.channels-section { display:flex; flex-direction:column; gap:14px; }
.channels-top-bar { display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px; padding:14px 16px; border-radius:12px; border:1px solid var(--line); background:var(--surface); }
.top-title { display:flex; align-items:center; gap:10px; }.amber-icon { color:#f59e0b; }.top-title h4 { margin:0; font-size:13px; font-weight:700; }.top-title p { margin:2px 0 0; font-size:11px; color:var(--muted); }
.pulse-all-btn { display:inline-flex; align-items:center; gap:6px; padding:8px 14px; border-radius:8px; border:none; background:var(--purple); color:#fff; font-size:11px; font-weight:700; cursor:pointer; }
.channels-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(260px,1fr)); gap:12px; }
</style>
