<script setup lang="ts">
import { ref, computed, onMounted, toRef } from 'vue'
import { Sparkles } from 'lucide-vue-next'
import type { PlatformId } from '../types'
import type { BrandAccount } from '../types/brand'
import PublisherNavbar, { type PublisherTab } from './publisher/PublisherNavbar.vue'
import PublisherComposer from './publisher/PublisherComposer.vue'
import PublisherQueueLogs from './publisher/PublisherQueueLogs.vue'
import PublisherChannels from './publisher/PublisherChannels.vue'
import { usePublisherPlatforms } from './publisher/composables/usePublisherPlatforms'
import { usePublisherWorkspace } from './publisher/composables/usePublisherWorkspace'

const props = defineProps<{
  brandId: string
  brandHandle?: string
  brandTone?: string
  brandAccounts: BrandAccount[]
  initialTab?: PublisherTab
}>()
const emit = defineEmits<{ (e: 'update-brand-account', platformId: string, handle: string): void }>()

const activeTab = ref<PublisherTab>(props.initialTab || 'compose')
const loading = ref(false)
const statusMessage = ref('')

function showToast(msg: string) {
  statusMessage.value = msg
  setTimeout(() => {
    if (statusMessage.value === msg) statusMessage.value = ''
  }, 4000)
}

const {
  platforms, postsQueue, activityLogs, trackedProjects, fetchSocialData,
  registerProjectForMarketing, removePost, triggerKeepAlive,
  savePlatformSettings, updatePlatformFromChannel
} = usePublisherWorkspace(toRef(props, 'brandId'), toRef(props, 'brandAccounts'), loading, showToast)

const { selectedPlatforms, generatedVariants, platformBadges: PLATFORM_BADGES, readyIds: configuredPlatformIds, activeChannelCount, togglePlatformSelection, updateVariant } = usePublisherPlatforms(
  toRef(props, 'brandAccounts'), platforms, fetchSocialData
)
const canPublish = computed(() => selectedPlatforms.value.length > 0 && selectedPlatforms.value.every(id => configuredPlatformIds.value.includes(id)))

async function generateAllVariants(payload?: {
  topic?: string
  rawNotes?: string
  tone?: string
  targetSubreddit?: string
  tags?: string[]
  includeCodeSnippet?: boolean
}) {
  loading.value = true
  try {
    const res = await fetch('/api/social/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        topic: payload?.topic || `${props.brandHandle || 'Company'} company update`,
        rawNotes: payload?.rawNotes || `Share a specific update from ${props.brandHandle || 'this company'} and why it matters.`,
        tone: payload?.tone || props.brandTone || 'Clear and authentic',
        includeCodeSnippet: payload?.includeCodeSnippet !== false,
        targetSubreddit: payload?.targetSubreddit || 'r/webdev',
        tags: payload?.tags || []
      })
    })
    if (res.ok) {
      const data = await res.json()
      if (data.variants) {
        generatedVariants.value = { ...generatedVariants.value, ...data.variants }
      }
      if (payload) showToast('Adapted for all 10 Human & AI platforms!')
    }
  } finally {
    loading.value = false
  }
}

async function submitPost(payload: {
  title: string
  rawNotes: string
  scheduledAt: string
  publishNow: boolean
  isDraft?: boolean
  webLink?: string
  imageUrl?: string
  videoUrl?: string
  tags?: string[]
}) {
  if (payload.publishNow && !canPublish.value) {
    showToast('Configure and test each selected channel before submitting for review.')
    return
  }
  loading.value = true
  try {
    const isDraft = Boolean(payload.isDraft)
    const res = await fetch('/api/social/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        brandId: props.brandId,
        title: payload.title,
        topic: payload.title,
        rawNotes: payload.rawNotes,
        status: isDraft ? 'draft' : undefined,
        platforms: selectedPlatforms.value,
        variants: generatedVariants.value,
        scheduledAt: isDraft || !payload.scheduledAt ? null : new Date(payload.scheduledAt).toISOString(),
        publishNow: payload.publishNow,
        webLink: payload.webLink,
        imageUrl: payload.imageUrl,
        videoUrl: payload.videoUrl,
        tags: payload.tags
      })
    })
    const data = await res.json()
    if (!res.ok || !data.success || !data.post?.id) {
      showToast(data.details || data.error || data.post?.reason || data.post?.message || 'Post was not created.')
      return
    }
    await fetchSocialData()
    if (isDraft || data.post.status === 'draft') {
      showToast('Post saved as draft.')
      activeTab.value = 'campaigns'
    } else if (data.post.status === 'pending_approval') {
      showToast('Submitted for human approval. No channel has been published yet.')
      activeTab.value = 'campaigns'
    } else if (data.post.status === 'scheduled') {
      showToast('Added to the schedule queue; automatic delivery is not confirmed.')
    } else {
      showToast(`Post created with status: ${data.post.status}.`)
    }
  } catch (error) {
    showToast(error instanceof Error ? error.message : 'Post request failed.')
  } finally {
    loading.value = false
  }
}

function isExtensionActive(): boolean {
  if (typeof document === 'undefined') return false
  return (
    document.documentElement.getAttribute('data-followdesk-extension') === 'active' ||
    Boolean((window as any).__FOLLOWDESK_EXTENSION_READY)
  )
}

function dispatchToExtensionBridge(items: Array<{ platformId: PlatformId; title: string; content: string }>) {
  if (typeof window === 'undefined') return
  window.postMessage(
    {
      type: 'FOLLOWDESK_WEB_TO_EXT_DISPATCH',
      requestId: `ext_${Date.now()}`,
      payload: { items }
    },
    '*'
  )
}

function openInstantIntent(platformId: PlatformId, customText?: string) {
  const content = customText || generatedVariants.value[platformId] || ''
  navigator.clipboard.writeText(content)

  if (isExtensionActive() && platformId !== 'ai_registry') {
    dispatchToExtensionBridge([
      {
        platformId,
        title: `${props.brandHandle || 'Company'} update`,
        content
      }
    ])
    showToast(`Extension opened & auto-filled ${PLATFORM_BADGES[platformId].label}!`)
    return
  }

  const encodedText = encodeURIComponent(content.slice(0, 270))
  const urls: Record<PlatformId, string> = {
    x: `https://twitter.com/intent/tweet?text=${encodedText}`,
    reddit: `https://www.reddit.com/submit?title=${encodeURIComponent(`${props.brandHandle || 'Company'} update`)}&text=${encodeURIComponent(content)}`,
    linkedin: `https://www.linkedin.com/feed/?shareActive=true&text=${encodedText}`,
    github: `https://gist.github.com/`,
    devto: `https://dev.to/new`,
    hashnode: `https://hashnode.com/create/story`,
    medium: `https://medium.com/new-story`,
    discord: `https://discord.com/app`,
    instagram: `https://www.instagram.com/`,
    ai_registry: `/api/marketing/llms.txt`
  }

  window.open(urls[platformId], '_blank', 'noopener,noreferrer')
  showToast(`Copied ${PLATFORM_BADGES[platformId].label} & launched!`)
}

onMounted(async () => {
  await fetchSocialData()
  await generateAllVariants()
})
</script>

<template>
  <div class="social-publisher-shell">
    <!-- Minimal Icon-Driven Section Navigation -->
    <PublisherNavbar
      :active-tab="activeTab"
      :active-count="activeChannelCount"
      @update:active-tab="activeTab = $event"
    />

    <!-- Compact Toast -->
    <div v-if="statusMessage" class="minimal-toast">
      <Sparkles :size="14" />
      <span>{{ statusMessage }}</span>
    </div>

    <!-- Section 1: Multi-Platform Composer -->
    <PublisherComposer
      v-if="activeTab === 'compose'"
      :brand-id="brandId"
      :loading="loading"
      :brand-name="brandHandle || 'Company'"
      :brand-tone="brandTone"
      :selected-platforms="selectedPlatforms"
      :available-platform-ids="selectedPlatforms"
      :configured-platform-ids="configuredPlatformIds"
      :generated-variants="generatedVariants"
      :platform-badges="PLATFORM_BADGES"
      @toggle-platform="togglePlatformSelection"
      @generate="generateAllVariants"
      @submit-post="submitPost"
      @open-intent="openInstantIntent"
      @update-variant="updateVariant"
      @show-toast="showToast"
    />

    <!-- Section 2: Queue & Live Automation Stream -->
    <PublisherQueueLogs
      v-else-if="activeTab === 'campaigns'"
      :posts-queue="postsQueue"
      :activity-logs="activityLogs"
      :platform-badges="PLATFORM_BADGES"
      @remove-post="removePost"
      @open-intent="openInstantIntent"
      @refresh="fetchSocialData" @show-toast="showToast"
      @create-post="activeTab = 'compose'"
    />

    <!-- Section 3: Channels & Keep-Alive Setup -->
    <PublisherChannels
      v-else-if="activeTab === 'channels'"
      :brand-id="brandId"
      :platforms="platforms"
      @meta-updated="fetchSocialData"
      @platform-updated="updatePlatformFromChannel"
      @trigger-keep-alive="triggerKeepAlive"
      @save-platform="savePlatformSettings"
      @assign-account="(platformId, handle) => emit('update-brand-account', platformId, handle)"
      @open-intent="openInstantIntent"
    />
  </div>
</template>

<style scoped>
.social-publisher-shell { min-width: 0; width: 100%;
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.minimal-toast {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 9px 14px;
  border-radius: 8px;
  background: rgba(16, 185, 129, 0.14);
  border: 1px solid rgba(16, 185, 129, 0.35);
  color: #10b981;
  font-size: 12px;
  font-weight: 600;
}
</style>
