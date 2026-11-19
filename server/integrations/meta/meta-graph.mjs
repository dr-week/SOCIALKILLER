import { randomBytes } from 'node:crypto'
import { getPlatformVaultCredentials, savePlatformVaultCredentials } from '../../credentials/credential-vault.mjs'

const pendingStates = new Map()
const graphVersion = () => process.env.META_GRAPH_API_VERSION || 'v27.0'
const graphUrl = path => `https://graph.facebook.com/${graphVersion()}/${path}`

function appConfig() {
  const { META_APP_ID: appId, META_APP_SECRET: appSecret, META_REDIRECT_URI: redirectUri } = process.env
  if (!appId || !appSecret || !redirectUri) {
    throw new Error('Set META_APP_ID, META_APP_SECRET, and META_REDIRECT_URI to enable Meta account linking.')
  }
  return { appId, appSecret, redirectUri }
}

export function createMetaAuthorizationUrl(brandId) {
  const { appId, redirectUri } = appConfig()
  const state = randomBytes(32).toString('hex')
  pendingStates.set(state, { brandId, expiresAt: Date.now() + 10 * 60_000 })
  const params = new URLSearchParams({
    client_id: appId,
    redirect_uri: redirectUri,
    response_type: 'code',
    state,
    scope: 'pages_show_list,pages_read_engagement,instagram_basic,instagram_content_publish'
  })
  return `https://www.facebook.com/${graphVersion()}/dialog/oauth?${params}`
}

async function graphRequest(path, params) {
  const url = new URL(graphUrl(path))
  for (const [key, value] of Object.entries(params)) url.searchParams.set(key, String(value))
  const response = await fetch(url)
  const data = await response.json().catch(() => ({}))
  if (!response.ok || data.error) throw new Error(data.error?.message || `Meta API request failed (${response.status}).`)
  return data
}

export async function completeMetaAuthorization({ code, state }) {
  const pending = pendingStates.get(state)
  pendingStates.delete(state)
  if (!pending || pending.expiresAt < Date.now()) throw new Error('Meta authorization expired. Start linking again.')
  const { appId, appSecret, redirectUri } = appConfig()
  const shortToken = await graphRequest('oauth/access_token', {
    client_id: appId, client_secret: appSecret, redirect_uri: redirectUri, code
  })
  let token = shortToken.access_token
  try {
    const longToken = await graphRequest('oauth/access_token', {
      grant_type: 'fb_exchange_token', client_id: appId, client_secret: appSecret, fb_exchange_token: token
    })
    token = longToken.access_token || token
  } catch { /* Keep the valid short-lived token if exchange is unavailable. */ }
  const response = await graphRequest('me/accounts', {
    fields: 'id,name,access_token,instagram_business_account{id,username}',
    access_token: token
  })
  const pages = (response.data || []).map(page => ({
    id: page.id,
    name: page.name,
    accessToken: page.access_token,
    instagram: page.instagram_business_account || null
  }))
  savePlatformVaultCredentials('meta', { userAccessToken: token, pages, linkedAt: new Date().toISOString() }, pending.brandId)
  return pending.brandId
}

export function getMetaConnection(brandId) {
  const saved = getPlatformVaultCredentials('meta', brandId)
  return {
    connected: Boolean(saved?.userAccessToken),
    pages: (saved?.pages || []).map(({ id, name, instagram }) => ({ id, name, instagram }))
  }
}

export function selectMetaAccount(brandId, pageId, instagramId) {
  const saved = getPlatformVaultCredentials('meta', brandId)
  if (!saved?.userAccessToken) throw new Error('Link a Meta account first.')
  const page = (saved.pages || []).find(item => item.id === pageId)
  if (!page) throw new Error('That Facebook Page is not available in the linked Meta account.')
  if (instagramId && page.instagram?.id !== instagramId) throw new Error('That Instagram account is not connected to the selected Page.')
  savePlatformVaultCredentials('instagram', {
    accessToken: instagramId ? page.accessToken : '',
    igBusinessId: instagramId || '',
    pageId: page.id,
    pageName: page.name,
    instagramUsername: page.instagram?.username || ''
  }, brandId)
  return { pageId: page.id, pageName: page.name, instagram: page.instagram }
}

export function disconnectMeta(brandId) {
  const current = getPlatformVaultCredentials('meta', brandId)
  if (!current) return false
  savePlatformVaultCredentials('meta', { ...current, disconnectedAt: new Date().toISOString(), userAccessToken: '', pages: [] }, brandId)
  savePlatformVaultCredentials('instagram', { accessToken: '', igBusinessId: '', pageId: '', pageName: '', instagramUsername: '' }, brandId)
  return true
}

