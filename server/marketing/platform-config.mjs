import { savePlatformVaultCredentials, getPlatformVaultCredentials } from '../credential-store.mjs'

const platformConfigs = new Map()
const DEFAULT_BRAND_ID = 'danger-labs'
const configKey = (brandId, platformId) => `${brandId}:${platformId}`
const hasCredentials = credentials => Object.entries(credentials || {}).some(([key, value]) =>
  /token|secret|apikey|webhook|password/i.test(key) && Boolean(value && String(value).trim())
)

export function getPlatformConfig(brandId, platformId) {
  const key = configKey(brandId, platformId)
  if (!platformConfigs.has(key)) {
    platformConfigs.set(key, {
      brandId, platformId, enabled: true, keepAliveEnabled: false,
      lastKeepAliveAt: null, streakDays: 0,
      credentials: getPlatformVaultCredentials(platformId, brandId) || {}
    })
  }
  return platformConfigs.get(key)
}

export function getPlatformsStatus(brandId = DEFAULT_BRAND_ID, supportedPlatforms = []) {
  return supportedPlatforms.map(platform => {
    const config = getPlatformConfig(brandId, platform.id)
    return {
      ...platform,
      brandId,
      enabled: config.enabled,
      keepAliveEnabled: config.keepAliveEnabled,
      lastKeepAliveAt: config.lastKeepAliveAt,
      streakDays: config.streakDays,
      isConfigured: hasCredentials(config.credentials) || platform.id === 'ai_registry',
      credentials: Object.fromEntries((platform.fields || []).map(field => [field, '']))
    }
  })
}

export function updatePlatformConfig(platformId, updates, brandId = DEFAULT_BRAND_ID) {
  const current = getPlatformConfig(brandId, platformId)
  const credentials = Object.fromEntries(
    Object.entries(updates.credentials || {}).filter(([, value]) => value != null && String(value).trim())
  )
  const updatedCreds = updates.replaceCredentials ? credentials : { ...(current.credentials || {}), ...credentials }
  const updated = { ...current, ...updates, credentials: updatedCreds }
  platformConfigs.set(configKey(brandId, platformId), updated)
  try {
    savePlatformVaultCredentials(platformId, updates.replaceCredentials
      ? { ...(current.credentials || {}), ...(updates.credentials || {}) }
      : updatedCreds, brandId)
  } catch (error) {
    console.warn('[Orchestrator Vault] Failed to save encrypted creds:', error.message)
  }
  return updated
}
