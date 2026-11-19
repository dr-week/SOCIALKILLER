<script setup lang="ts">
import { onMounted, ref, toRef } from 'vue'
import PublisherChannels from '../../components/publisher/PublisherChannels.vue'
import { usePublisherWorkspace } from '../../components/publisher/composables/usePublisherWorkspace'
import type { BrandAccount } from '../../types/brand'
import type { PlatformId, SocialPlatformStatus } from '../../types'

const props = defineProps<{ brandId: string; brandName: string; brandAccounts: BrandAccount[] }>()
const emit = defineEmits<{ (event: 'update-brand-account', platformId: string, handle: string): void }>()
const loading = ref(false)
const statusMessage = ref('')
const { platforms, fetchSocialData, triggerKeepAlive, savePlatformSettings, updatePlatformFromChannel } =
  usePublisherWorkspace(toRef(props, 'brandId'), toRef(props, 'brandAccounts'), loading, message => { statusMessage.value = message })

onMounted(() => { void fetchSocialData() })

function openChannel(platformId: PlatformId) {
  const destinations: Record<PlatformId, string> = {
    instagram: 'https://www.instagram.com/', x: 'https://twitter.com/intent/tweet',
    linkedin: 'https://www.linkedin.com/feed/?shareActive=true', reddit: 'https://www.reddit.com/submit',
    github: 'https://gist.github.com/', devto: 'https://dev.to/new',
    hashnode: 'https://hashnode.com/create/story', medium: 'https://medium.com/new-story',
    discord: 'https://discord.com/app', ai_registry: '/api/marketing/llms.txt'
  }
  window.open(destinations[platformId], '_blank', 'noopener,noreferrer')
}
</script>

<template>
  <main class="connections-workspace">
    <header><p>ACTIVE BRAND · {{ brandName }}</p><h1>Connections</h1><span>Manage this brand’s channel configuration. A handle or saved credential is not proof of an authorized connection.</span></header>
    <p v-if="statusMessage" class="connection-message" role="status">{{ statusMessage }}</p>
    <PublisherChannels
      :brand-id="brandId" :platforms="platforms"
      @meta-updated="fetchSocialData" @platform-updated="updatePlatformFromChannel"
      @trigger-keep-alive="triggerKeepAlive"
      @save-platform="(platform: SocialPlatformStatus) => savePlatformSettings(platform)"
      @assign-account="(platformId: string, handle: string) => emit('update-brand-account', platformId, handle)"
      @open-intent="(platformId: PlatformId) => openChannel(platformId)"
    />
  </main>
</template>

<style scoped>
.connections-workspace { max-width: 1240px; margin: 0 auto; }
.connections-workspace header {
  position: relative; overflow: hidden; margin-bottom: 16px; padding: 22px 24px;
  border: 1px solid var(--glass-border); border-radius: 22px;
  background: radial-gradient(ellipse at 100% 0%, rgba(84, 214, 238, .14), transparent 48%), linear-gradient(130deg, var(--surface-card), var(--surface));
  box-shadow: var(--card-shadow);
}
.connections-workspace header p { margin: 0; color: #54d6ee; font-size: 9px; font-weight: 700; letter-spacing: .12em; }
.connections-workspace h1 { margin: 8px 0 5px; font: 700 clamp(24px, 3vw, 30px) Manrope, sans-serif; letter-spacing: -.03em; }
.connections-workspace header span { color: var(--muted); font-size: 11px; line-height: 1.6; }
.connection-message { padding: 10px 13px; border: 1px solid var(--line); border-radius: 11px; background: var(--surface-raised); color: var(--ink); font-size: 11px; }
</style>
