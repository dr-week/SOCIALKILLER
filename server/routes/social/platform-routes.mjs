import {
  getPlatformsStatus,
  updatePlatformConfig,
  getSocialActivityLogs
} from '../../social-publisher.mjs'
import { dbService } from '../../db/sqlite-engine.mjs'
import { getPlatformCredentials } from '../../credential-store.mjs'
import { DEFAULT_BRANDS } from '../../marketing/story-generator.mjs'
import { requestedBrandId } from './requested-brand-id.mjs'

export async function handleSocialPlatformRoutes(req, res, url, json) {
  if (req.method === 'GET' && url.pathname === '/api/social/platforms') {
    const brandId = requestedBrandId(url, json, res)
    if (!brandId) return true
    return json(res, 200, {
      success: true,
      brandId,
      platforms: getPlatformsStatus(brandId),
      activityLogs: getSocialActivityLogs(brandId)
    })
  }

  if (req.method === 'POST' && url.pathname === '/api/social/platforms') {
    let body = ''
    req.on('data', chunk => { body += chunk })
    req.on('end', () => {
      try {
        const parsed = JSON.parse(body || '{}')
        if (!parsed.platformId) return json(res, 400, { error: 'platformId is required' })
        const brandId = parsed.brandId || 'danger-labs'
        if (!/^[a-z0-9-]{1,64}$/.test(brandId) ||
            (!dbService.getBrandProfile(brandId) && !DEFAULT_BRANDS.some(brand => brand.id === brandId))) {
          return json(res, 404, { error: 'Company workspace not found.' })
        }
        if (!getPlatformsStatus(brandId).some(platform => platform.id === parsed.platformId)) {
          return json(res, 404, { error: `Unknown platform: ${parsed.platformId}` })
        }
        if (parsed.credentials != null && (typeof parsed.credentials !== 'object' || Array.isArray(parsed.credentials))) {
          return json(res, 400, { error: 'credentials must be an object' })
        }
        const updated = updatePlatformConfig(parsed.platformId, parsed, brandId)
        if (!updated) return json(res, 404, { error: `Unknown platform: ${parsed.platformId}` })
        return json(res, 200, {
          success: true,
          platform: {
            ...updated,
            brandId,
            isConfigured: Object.entries(updated.credentials || {}).some(([key, value]) =>
              /token|secret|apikey|webhook|password/i.test(key) && Boolean(value && String(value).trim())
            ),
            credentials: Object.fromEntries((updated.fields || []).map(field => [field, '']))
          }
        })
      } catch {
        return json(res, 400, { error: 'Invalid JSON payload' })
      }
    })
    return true
  }

  if (req.method === 'POST' && url.pathname === '/api/social/test-connection') {
    let body = ''
    req.on('data', chunk => { body += chunk })
    req.on('end', async () => {
      try {
        const parsed = JSON.parse(body || '{}')
        const platformId = parsed.platformId
        if (!platformId) return json(res, 400, { error: 'platformId is required' })
        const brandId = parsed.brandId || 'danger-labs'
        if (!/^[a-z0-9-]{1,64}$/.test(brandId) ||
            (!dbService.getBrandProfile(brandId) && !DEFAULT_BRANDS.some(brand => brand.id === brandId))) {
          return json(res, 404, { error: 'Company workspace not found.' })
        }
        const credentials = getPlatformCredentials(platformId, { brandId, credentials: parsed.credentials || {} })
        let pingResult = { connected: false, message: 'Platform does not support ping' }
        const pingAdapters = {
          instagram: '../../posting/instagram/index.mjs',
          x: '../../posting/x/index.mjs',
          reddit: '../../posting/reddit/index.mjs',
          linkedin: '../../posting/linkedin/index.mjs',
          github: '../../posting/github/index.mjs',
          devto: '../../posting/devto/index.mjs',
          hashnode: '../../posting/hashnode/index.mjs',
          discord: '../../posting/discord/index.mjs'
        }
        if (platformId === 'ai_registry') {
          pingResult = { connected: true, message: 'AI Registry catalog active (/api/marketing/llms.txt)' }
        } else if (pingAdapters[platformId]) {
          const { ping } = await import(pingAdapters[platformId])
          pingResult = await ping(credentials)
        }
        return json(res, 200, { success: true, brandId, platformId, ...pingResult })
      } catch (error) {
        return json(res, 500, { error: 'Ping failed', details: error.message })
      }
    })
    return true
  }
  return false
}
