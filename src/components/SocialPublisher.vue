<script setup lang="ts">
import { ref, computed, onMounted, toRef } from 'vue'
import { Sparkles } from 'lucide-vue-next'
import type { PlatformId } from '../types'
import type { BrandAccount } from '../types/brand'
import PublisherNavbar, { type PublisherTab } from './publisher/PublisherNavbar.vue'
import PublisherComposer from './publisher/PublisherComposer.vue'
import PublisherQueueLogs from './publisher/PublisherQueueLogs.vue'
import { usePublisherPlatforms } from './publisher/composables/usePublisherPlatforms'
import { usePublisherWorkspace } from './publisher/composables/usePublisherWorkspace'
import { launchPublisherPlatformIntent } from './publisher/composables/usePublisherExtensionBridge'
import { usePublisherPostActions } from './publisher/composables/usePublisherPostActions'

const props = defineProps<{
  brandId: string
  brandHandle?: string
  brandTone?: string
  brandAccounts: BrandAccount[]
  searchQuery?: string
  initialTab?: PublisherTab
}>()
const emit = defineEmits<{
  (e: 'update-brand-account', platformId: string, handle: string): void
  (e: 'open-connections'): void
}>()

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
  platforms, postsQueue, activityLogs, fetchSocialData, removePost
} = usePublisherWorkspace(toRef(props, 'brandId'), toRef(props, 'brandAccounts'), loading, showToast)

const {
  availablePlatformIds, selectedPlatforms, generatedVariants, platformBadges: PLATFORM_BADGES,
  readyIds: configuredPlatformIds, activeChannelCount, togglePlatformSelection, updateVariant
} = usePublisherPlatforms(toRef(props, 'brandAccounts'), platforms, fetchSocialData)

const canPublish = computed(() =>
  selectedPlatforms.value.length > 0 &&
  selectedPlatforms.value.every(id => configuredPlatformIds.value.includes(id))
)

const { generateAllVariants, submitPost } = usePublisherPostActions({
  brandId: () => props.brandId,
  brandHandle: () => props.brandHandle,
  brandTone: () => props.brandTone,
  selectedPlatforms,
  generatedVariants,
  canPublish,
  loading,
  fetchSocialData,
  showToast,
  onNavigateTab: (tab) => {
    if (tab === 'channels') emit('open-connections')
    else activeTab.value = tab
  }
})

function openInstantIntent(platformId: PlatformId, customText?: string) {
  const content = customText || generatedVariants.value[platformId] || ''
  launchPublisherPlatformIntent(
    platformId,
    content,
    props.brandHandle || 'Company',
    PLATFORM_BADGES[platformId].label,
    showToast
  )
}

onMounted(async () => {
  await fetchSocialData()
  await generateAllVariants()
})
</script>

<template>
  <div class="social-publisher-shell">
    <PublisherNavbar
      :active-tab="activeTab"
      :active-count="activeChannelCount"
      @update:active-tab="activeTab = $event"
      @open-connections="emit('open-connections')"
    />

    <div v-if="statusMessage" class="minimal-toast">
      <Sparkles :size="14" />
      <span>{{ statusMessage }}</span>
    </div>

    <PublisherComposer
      v-if="activeTab === 'compose'"
      :brand-id="brandId"
      :loading="loading"
      :brand-name="brandHandle || 'Company'"
      :brand-tone="brandTone"
      :selected-platforms="selectedPlatforms"
      :available-platform-ids="availablePlatformIds"
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

    <PublisherQueueLogs
      v-else
      :posts-queue="postsQueue"
      :activity-logs="activityLogs"
      :platform-badges="PLATFORM_BADGES"
      :search-query="searchQuery"
      @remove-post="removePost"
      @open-intent="openInstantIntent"
      @refresh="fetchSocialData"
      @show-toast="showToast"
      @create-post="activeTab = 'compose'"
    />
  </div>
</template>

<style scoped lang="scss">
.social-publisher-shell { min-width: 0; width: 100%; display: flex; flex-direction: column; gap: 14px; }
.minimal-toast { display: flex; align-items: center; gap: 8px; padding: 9px 14px; border-radius: 8px; background: rgba(16, 185, 129, 0.14); border: 1px solid rgba(16, 185, 129, 0.35); color: #10b981; font-size: 12px; font-weight: 600; }
</style>
