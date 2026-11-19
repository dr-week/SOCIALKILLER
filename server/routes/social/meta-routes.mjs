import { dbService } from '../../db/sqlite-engine.mjs'
import { DEFAULT_BRANDS } from '../../marketing/story-generator.mjs'
import { updatePlatformConfig } from '../../social-publisher.mjs'
import { getPlatformVaultCredentials } from '../../credentials/credential-vault.mjs'
import {
  completeMetaAuthorization,
  createMetaAuthorizationUrl,
  disconnectMeta,
  getMetaConnection,
  selectMetaAccount
} from '../../integrations/meta/meta-graph.mjs'

const validBrand = id => /^[a-z0-9-]{1,64}$/.test(id) &&
  (Boolean(dbService.getBrandProfile(id)) || DEFAULT_BRANDS.some(brand => brand.id === id))

export async function handleMetaRoutes(req, res, url, json) {
  if (req.method === 'GET' && url.pathname === '/api/social/meta/status') {
    const brandId = url.searchParams.get('brandId') || 'danger-labs'
    if (!validBrand(brandId)) return json(res, 404, { error: 'Company workspace not found.' })
    return json(res, 200, { brandId, ...getMetaConnection(brandId) })
  }

  if (req.method === 'GET' && url.pathname === '/api/social/meta/connect') {
    const brandId = url.searchParams.get('brandId') || 'danger-labs'
    if (!validBrand(brandId)) return json(res, 404, { error: 'Company workspace not found.' })
    try {
      res.writeHead(302, { location: createMetaAuthorizationUrl(brandId), 'cache-control': 'no-store' })
      res.end()
    } catch (error) {
      return json(res, 503, { error: error.message })
    }
    return true
  }

  if (req.method === 'GET' && url.pathname === '/api/social/meta/callback') {
    const code = url.searchParams.get('code')
    const state = url.searchParams.get('state')
    const error = url.searchParams.get('error_description') || url.searchParams.get('error')
    const escape = value => String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char])
    let message = error || 'Meta did not return an authorization code.'
    let success = false
    try {
      if (code && state && !error) {
        const brandId = await completeMetaAuthorization({ code, state })
        message = `Meta is linked to workspace ${brandId}. Return to FollowDesk and select a Page.`
        success = true
      }
    } catch (cause) { message = cause instanceof Error ? cause.message : 'Meta linking failed.' }
    res.writeHead(success ? 200 : 400, { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' })
    res.end(`<!doctype html><meta name="viewport" content="width=device-width"><title>Meta account linking</title><main style="font:16px system-ui;max-width:36rem;margin:4rem auto;padding:1rem"><h1>${success ? 'Meta account linked' : 'Meta linking failed'}</h1><p>${escape(message)}</p><p>You can close this tab and return to FollowDesk.</p></main>`)
    return true
  }

  if (req.method === 'POST' && (url.pathname === '/api/social/meta/select' || url.pathname === '/api/social/meta/disconnect')) {
    let body = ''
    req.on('data', chunk => { body += chunk })
    req.on('end', () => {
      try {
        const parsed = JSON.parse(body || '{}')
        const brandId = parsed.brandId || 'danger-labs'
        if (!validBrand(brandId)) return json(res, 404, { error: 'Company workspace not found.' })
        if (url.pathname.endsWith('/disconnect')) {
          disconnectMeta(brandId)
          updatePlatformConfig('instagram', { credentials: { accessToken: '', igBusinessId: '', pageId: '' }, replaceCredentials: true }, brandId)
          return json(res, 200, { success: true, ...getMetaConnection(brandId) })
        }
        if (!parsed.pageId) return json(res, 400, { error: 'pageId is required.' })
        const selected = selectMetaAccount(brandId, parsed.pageId, parsed.instagramId || '')
        // Keep the account selector and the existing publisher settings in sync.
        const vaultCredentials = getPlatformVaultCredentials('instagram', brandId)
        updatePlatformConfig('instagram', { credentials: vaultCredentials || {} }, brandId)
        return json(res, 200, { success: true, selected })
      } catch (error) { return json(res, 400, { error: error instanceof Error ? error.message : 'Meta account update failed.' }) }
    })
    return true
  }
  return false
}
