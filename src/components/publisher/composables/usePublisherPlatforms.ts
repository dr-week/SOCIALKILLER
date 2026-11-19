import { computed, ref, watch, type Ref } from 'vue'
import type { BrandAccount } from '../../../types/brand'
import type { PlatformId, SocialPlatformStatus } from '../../../types'
import { isReadyForImmediatePublishing } from '../../../features/social-accounts'

const AVAILABLE_IDS: readonly PlatformId[] = ['instagram', 'x', 'linkedin', 'reddit', 'github', 'discord', 'devto', 'hashnode', 'medium', 'ai_registry']

export function usePublisherPlatforms(
  accounts: Readonly<Ref<BrandAccount[]>>,
  platforms: Readonly<Ref<SocialPlatformStatus[]>>,
  onAccountsChanged: () => void
) {
  const selectAccounts = (items: BrandAccount[]) => items
    .map(account => account.platformId)
    .filter((id): id is PlatformId => AVAILABLE_IDS.includes(id as PlatformId))
  const selectedPlatforms = ref<PlatformId[]>(selectAccounts(accounts.value))
  const generatedVariants = ref<Record<PlatformId, string>>({
    instagram: '', x: '', linkedin: '', reddit: '', github: '', discord: '',
    devto: '', hashnode: '', medium: '', ai_registry: ''
  })
  const platformBadges: Record<PlatformId, { icon: string; color: string; bg: string; label: string }> = {
    instagram: { icon: 'IG', color: '#e1306c', bg: 'rgba(225, 48, 108, 0.12)', label: 'Instagram' },
    x: { icon: 'X', color: '#38bdf8', bg: 'rgba(56, 189, 248, 0.12)', label: 'X / Twitter' },
    linkedin: { icon: 'IN', color: '#0a66c2', bg: 'rgba(10, 102, 194, 0.14)', label: 'LinkedIn' },
    reddit: { icon: 'RD', color: '#ff4500', bg: 'rgba(255, 69, 0, 0.12)', label: 'Reddit' },
    github: { icon: 'GH', color: '#a855f7', bg: 'rgba(168, 85, 247, 0.14)', label: 'GitHub' },
    discord: { icon: 'DC', color: '#5865f2', bg: 'rgba(88, 101, 242, 0.14)', label: 'Discord' },
    devto: { icon: 'DEV', color: '#10b981', bg: 'rgba(16, 185, 129, 0.12)', label: 'Dev.to Blog' },
    hashnode: { icon: 'HN', color: '#2962ff', bg: 'rgba(41, 98, 255, 0.12)', label: 'Hashnode' },
    medium: { icon: 'MED', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.12)', label: 'Medium' },
    ai_registry: { icon: 'AI', color: '#10b981', bg: 'rgba(16, 185, 129, 0.16)', label: 'AI Agent Market' }
  }

  watch(accounts, value => {
    selectedPlatforms.value = selectAccounts(value)
    onAccountsChanged()
  }, { deep: true })
  const availablePlatformIds = computed<PlatformId[]>(() => [...AVAILABLE_IDS])
  const readyIds = computed(() => platforms.value.filter(isReadyForImmediatePublishing).map(platform => platform.id))
  const activeChannelCount = computed(() => platforms.value.filter(platform =>
    isReadyForImmediatePublishing(platform) && platform.id !== 'ai_registry' && selectedPlatforms.value.includes(platform.id)
  ).length)

  function togglePlatformSelection(id: PlatformId) {
    const index = selectedPlatforms.value.indexOf(id)
    if (index >= 0) {
      if (selectedPlatforms.value.length > 1) selectedPlatforms.value.splice(index, 1)
    } else selectedPlatforms.value.push(id)
  }

  function updateVariant(id: PlatformId, text: string) {
    generatedVariants.value[id] = text
  }

  return { availablePlatformIds, selectedPlatforms, generatedVariants, platformBadges, readyIds, activeChannelCount, togglePlatformSelection, updateVariant }
}
