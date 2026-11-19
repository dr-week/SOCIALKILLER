import { ref, type Ref } from 'vue'
import type { BrandAccount } from '../../../types/brand'
import type { PlatformId, SocialPlatformStatus, SocialPostItem, TrackedProject } from '../../../types'

export function usePublisherWorkspace(
  brandId: Readonly<Ref<string>>,
  brandAccounts: Readonly<Ref<BrandAccount[]>>,
  loading: Ref<boolean>,
  showToast: (message: string) => void
) {
  const platforms = ref<SocialPlatformStatus[]>([])
  const postsQueue = ref<SocialPostItem[]>([])
  const activityLogs = ref<any[]>([])
  const trackedProjects = ref<TrackedProject[]>([])

  async function fetchSocialData() {
    try {
      const [platformResponse, postsResponse, projectsResponse] = await Promise.all([
        fetch(`/api/social/platforms?brandId=${encodeURIComponent(brandId.value)}`),
        fetch(`/api/social/posts?brandId=${encodeURIComponent(brandId.value)}`),
        fetch('/api/marketing/projects')
      ])
      const unavailable: string[] = []
      if (platformResponse.ok) {
        const data = await platformResponse.json()
        platforms.value = (data.platforms || []).map((platform: SocialPlatformStatus) => ({
          ...platform,
          handle: brandAccounts.value.find(account => account.platformId === platform.id)?.handle
        }))
        activityLogs.value = data.activityLogs || []
      } else unavailable.push('channels')
      if (postsResponse.ok) postsQueue.value = (await postsResponse.json()).posts || []
      else unavailable.push('queue')
      if (projectsResponse.ok) trackedProjects.value = (await projectsResponse.json()).projects || []
      else unavailable.push('content catalog')
      if (unavailable.length) showToast(`Could not load ${unavailable.join(', ')}. Retry from this workspace.`)
    } catch (cause) {
      showToast(cause instanceof Error ? `Could not load publisher data: ${cause.message}` : 'Could not load publisher data.')
    }
  }

  async function registerProjectForMarketing(project: Partial<TrackedProject>) {
    loading.value = true
    try {
      const response = await fetch('/api/marketing/projects', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(project)
      })
      if (response.ok) {
        await fetchSocialData()
        showToast('Added framework to the AI discovery catalog.')
      }
    } finally { loading.value = false }
  }

  async function removePost(id: string) {
    await fetch(`/api/social/posts?id=${encodeURIComponent(id)}&brandId=${encodeURIComponent(brandId.value)}`, { method: 'DELETE' })
    await fetchSocialData()
    showToast('Removed from queue.')
  }

  async function triggerKeepAlive(platformId?: PlatformId) {
    loading.value = true
    try {
      const response = await fetch('/api/social/keep-alive', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ brandId: brandId.value, platformId: platformId || null })
      })
      if (response.ok) {
        const data = await response.json()
        platforms.value = data.platforms || platforms.value
        activityLogs.value = data.activityLogs || activityLogs.value
        showToast(`Keep-Alive Heartbeat pulsed (${data.pulsedCount} accounts)!`)
      } else showToast('Could not update channel activity. Please retry.')
    } finally { loading.value = false }
  }

  async function savePlatformSettings(platform: SocialPlatformStatus) {
    const response = await fetch('/api/social/platforms', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        platformId: platform.id, brandId: brandId.value,
        keepAliveEnabled: platform.keepAliveEnabled,
        keepAliveFrequency: platform.keepAliveFrequency,
        credentials: platform.credentials
      })
    })
    if (!response.ok) {
      showToast(`Could not save ${platform.name} settings. Please retry.`)
      return
    }
    await fetchSocialData()
    showToast(`Saved ${platform.name} settings!`)
  }

  function updatePlatformFromChannel(platform: SocialPlatformStatus) {
    const index = platforms.value.findIndex(item => item.id === platform.id)
    if (index >= 0) platforms.value[index] = platform
  }

  return {
    platforms, postsQueue, activityLogs, trackedProjects, fetchSocialData,
    registerProjectForMarketing, removePost, triggerKeepAlive,
    savePlatformSettings, updatePlatformFromChannel
  }
}
