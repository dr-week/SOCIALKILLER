export interface PlatformReadinessInput {
  id: string
  isConfigured?: boolean
  connectionVerified?: boolean
}

export type PublishingReadiness = 'unconfigured' | 'verification-required' | 'ready'

export function getPublishingReadiness(platform: PlatformReadinessInput): PublishingReadiness {
  if (platform.id === 'ai_registry') return 'ready'
  if (!platform.isConfigured) return 'unconfigured'
  return platform.connectionVerified ? 'ready' : 'verification-required'
}

export function isReadyForImmediatePublishing(platform: PlatformReadinessInput): boolean {
  return getPublishingReadiness(platform) === 'ready'
}
