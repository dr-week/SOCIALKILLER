import { computed, ref, watch, type Ref } from 'vue'
import type { SocialPlatformStatus } from '../../../types'

export function useChannelConnectionCheck(
  brandId: Readonly<Ref<string>>,
  platform: Readonly<Ref<SocialPlatformStatus>>,
  update: (value: SocialPlatformStatus) => void
) {
  const testStatus = ref<{ testing?: boolean; connected?: boolean; msg?: string }>()
  const updatePlatform = (patch: Partial<SocialPlatformStatus>) => update({ ...platform.value, ...patch })

  const connectionLabel = computed(() => platform.value.id === 'ai_registry'
    ? 'Built-in catalog'
    : !platform.value.isConfigured ? 'Not configured'
      : platform.value.connectionVerified ? 'Verified this session' : 'Credentials saved · test required')

  watch(() => platform.value.connectionVerified, verified => {
    if (!verified && !testStatus.value?.testing) testStatus.value = undefined
  })

  async function testConnection() {
    updatePlatform({ connectionVerified: false })
    testStatus.value = { testing: true }
    try {
      const response = await fetch('/api/social/test-connection', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ brandId: brandId.value, platformId: platform.value.id, credentials: platform.value.credentials })
      })
      const data = await response.json()
      const connected = Boolean(response.ok && data.connected)
      testStatus.value = connected
        ? { connected, msg: data.username || data.name || 'Connected' }
        : { connected, msg: data.error || (data.status ? `Status ${data.status}` : 'Offline/Fallback') }
      updatePlatform({ connectionVerified: connected })
    } catch (error) {
      testStatus.value = { connected: false, msg: error instanceof Error ? error.message : 'Connection check failed' }
      updatePlatform({ connectionVerified: false })
    }
  }

  return { testStatus, connectionLabel, testConnection }
}
